require('dotenv').config()


const express = require('express');
const app = express();
const port = 8800; //porta padrão
const mysql = require('mysql2');
const cors = require('cors')


app.use(express.json());
app.use( cors());


app.get('/', (req, res) => res.json({ message: 'Funcionando!' }));

//inicia o servidor
app.listen(port);
console.log('API funcionando!');





function execSQLQuery(sqlQry, res){
  const connection = mysql.createConnection({
    host     : process.env.HOST_DB,
    port     : process.env.PORT_DB,
    user     : process.env.USER_DB,
    password : process.env.PASSWORD_DB,
    database : process.env.DATABASE_DB
  });
 
  connection.query(sqlQry, (error, results, fields) => {
      if(error) 
        res.json(error);
      else
        res.json(results);
      connection.end();
      console.log('executou!');
  });
}


app.get('/cardifVolks', (req, res) => {
    execSQLQuery(`select
    CASE 
      -- De acordo com o GIT, assim que a carga carrega o venda já é validada. WHEN s.statusId = 1 and DATEDIFF(NOW(),s.created) < 1 THEN "OK - Venda processando dentro do prazo"
      WHEN s.statusId = 1 and DATEDIFF(NOW(),s.created) > 60 THEN "ERRO - Venda processando por mais de 60 dias, deveria ser reprovado por ausente?"
      WHEN v.statusDetailId = 8 THEN IF(GROUP_CONCAT(sDuplicate.id)  is null, "ERRO - Venda duplicada não encontrada","OK - Duplicidade encontrado") -- A duplicidade é encontrada na venda aprovada, ou seja, se existir apenas duas vendas registradas e todas reprovadas não vai encontrar duplicidade
      WHEN s.id in (2035956,2035992,2033181,2078825,2078832,2035837,2105282,2105303,2090358,2047018,2075987,2125225,2098133,2098136,2129943,2129947,2124140) THEN "OK - O problema foi identificado e resolvido no passado."
      WHEN cs.saleDate < c.campaignStart and s.statusId = 2 or cs.saleDate > c.campaignEnd and s.statusId = 2 THEN "ERRO - Venda aprovada, mas a nota estava fora do período da campanha"
      WHEN cs.saleDate < c.campaignStart and s.statusId <> 2 or cs.saleDate > c.campaignEnd and s.statusId <> 2 THEN "OK - Venda não foi cadastrada dentro do período da campanha"
      WHEN v.id is null and DATEDIFF(NOW(),s.created)  < vr.validationPeriod THEN "OK - venda processando sem lote dentro do prazo"
      WHEN s.campaignId in (11102,11104) and cs.product REGEXP "(SPF)" and s.statusId <> 2 THEN "ERRO - Produto Correto, mas a venda não foi aprovada ainda"
      WHEN s.campaignId in (11102,11104) and cs.product NOT REGEXP "(SPF)" and s.statusId <> 3 THEN "ERRO - Produto incorreto, mas a venda não foi reprovada ainda"
      WHEN s.campaignId in (11101,11103) and cs.product REGEXP "(Garantia)" and s.statusId <> 2 THEN "ERRO - Produto Correto, mas a venda não foi aprovada ainda"
      WHEN s.campaignId in (11101,11103) and cs.product NOT REGEXP "(Garantia)" and s.statusId <> 3 THEN "ERRO - Produto incorreto, mas a venda não foi reprovada ainda"
      WHEN s.statusId = 1 and cs.id is null THEN "OK - Venda Processando Corretamente, pois não recebemos na carga ainda"
      WHEN s.campaignId in (11102,11104) and cs.product REGEXP "(SPF)" and s.statusId = 2 THEN "OK - Venda Aprovada corretamente"
      WHEN s.campaignId in (11101,11103) and cs.product REGEXP "(Garantia)" and s.statusId = 2 THEN "OK - Venda Aprovada corretamente"
      WHEN s.campaignId in (11102,11104) and cs.product NOT REGEXP "(SPF)" and s.statusId = 3 THEN "OK - Venda Reprovada corretamente"
      WHEN s.campaignId in (11101,11103) and cs.product NOT REGEXP "(Garantia)" and s.statusId = 3 THEN "OK - Venda Reprovada corretamente"
      WHEN s.statusId = 1 and cs.id is not null THEN "ERRO - Venda processando de forma errada, pois recebemos a venda na carga "
      ELSE "ERRO - Não Mapeado"
    END	AS ValidationQuery,DATEDIFF(NOW(),s.created)"Tempo criado",	
      s.id "SaleId",
     vr.validationPeriod, 
      s.statusId "StatusID",
      c.validationPeriod "PeriodoDeValidação",	
      c.companyId,
      statusSale.description "SaleStatus",
      statusValidation.description "ValidationDescription",
      statusDetailValidation.description "ValidationStatusDetail",
      statusDetailValidation.message "ValidationMessage",
      CONCAT(c.id, " ", c.internalName) "Campanha",
      IF(cs.saleDate >= c.campaignStart  and cs.saleDate <= c.campaignEnd, "True",if(cs.id is null, "Não se aplica no momento", "False")) "Dentro do período da campaha?",
      cs.saleDate "SaleDateCardif",
      s.created "SaleDateRegistro",
      c.campaignStart "InicioDaCampanha",
      c.campaignEnd "FimDaCampanha",
      s.input "SaleInput",
      p.name "ProductName",
      v.validationBatchId,
      u.cpf "CPF",
      if(cu.eligible,
      "Elegível",
      "Não") "Usuário Elegível?",
      t.amount "Transaction",
      cs.id "id na PlayCardifsales",
      cs.input "InputEncontrado",
      cs.created "CriaçãoDacarga",
      cs.product "ProdutoCardif",
      GROUP_CONCAT(sDuplicate.id) "sDuplicateID",
      GROUP_CONCAT(sDuplicate.input) "InputDuplicate"
  from
      Sale s
  LEFT JOIN playground.CardifSales cs on
      LPAD(cs.input, 50, '0') = LPAD(s.input, 50, '0')
  left join Status statusSale on
      statusSale.id = s.statusId
  left join Campaign c on
      c.id = s.campaignId
  left join ProductCampaign pc on
      pc.id = s.productCampaignId
  left join Product p on
      p.id = pc.productId
  left join Validation v on
      v.sourceTypeId = 1
      and v.sourceId = s.id
  LEFT JOIN ValidationRule vr on vr.id = 92
  left join Status statusValidation on
      statusValidation.id = v.statusId
  left join StatusDetail statusDetailValidation on
      statusDetailValidation.id = v.statusDetailId
  left join Credit c2 on
      c2.validationId = v.id
  left join Transaction t on
      t.id = c2.transactionId
  left join Seller s2 on
      s2.id = s.sellerId
  left join User u on
      u.id = s2.userId
  left join Account a on
      a.id = u.accountId
  left join CampaignUser cu on
      cu.userId = u.id
      and cu.campaignId = c.id
  left join Sale sDuplicate on s.input = sDuplicate.input and s.id <>sDuplicate.id and sDuplicate.statusId <> 3 
  where TRUE 
  and c.internalName  REGEXP "(Volks)"
   and s.id in (2029684,2029684,2029685,2029685,2029686,2029686,2029694,2029752,2029752,2029753)
  -- s.campaignId in (11101,11102,11103,11104)-- and s.id in (2089007,2086942,2098610,2089020)
  GROUP BY s.id, statusSale.id, v.id, c2.id, cu.id, cs.id 
  HAVING ValidationQuery REGEXP "(-)"`, res)
   // console.log(res)
})
app.get('/cardifDucati', (req, res) => {
    execSQLQuery(`select
    CASE 
      -- De acordo com o GIT, assim que a carga carrega o venda já é validada. WHEN s.statusId = 1 and DATEDIFF(NOW(),s.created) < 1 THEN "OK - Venda processando dentro do prazo"
          WHEN s.statusId = 1 and DATEDIFF(NOW(),s.created) > 60 THEN "ERRO - Venda processando por mais de 60 dias, deveria ser reprovado por ausente?"
      WHEN v.statusDetailId = 8 THEN IF(GROUP_CONCAT(sDuplicate.id)  is null, "ERRO - Venda duplicada não encontrada","OK - Duplicidade encontrado") -- A duplicidade é encontrada na venda aprovada, ou seja, se existir apenas duas vendas registradas e todas reprovadas não vai encontrar duplicidade
      WHEN cs.saleDate < c.campaignStart and s.statusId = 2 or cs.saleDate > c.campaignEnd and s.statusId = 2 THEN "ERRO - Venda aprovada, mas a nota estava fora do período da campanha"
      WHEN cs.saleDate < c.campaignStart and s.statusId <> 2 or cs.saleDate > c.campaignEnd and s.statusId <> 2 THEN "OK - Venda não foi cadastrada dentro do período da campanha"
      WHEN v.id is null and DATEDIFF(NOW(),s.created)  < vr.validationPeriod THEN "OK - venda processando sem lote dentro do prazo"
      WHEN s.campaignId in (11099) and cs.product REGEXP "(Garantia Estendida Original (Ever Red))" and s.statusId <> 2 THEN "ERRO - Produto Correto, mas a venda não foi aprovada ainda"
      WHEN s.campaignId in (11099) and cs.product NOT REGEXP "(Garantia Estendida Original (Ever Red))" and s.statusId <> 3 THEN "ERRO - Produto incorreto, mas a venda não foi reprovada ainda"
      WHEN s.statusId = 1 and cs.id is null THEN "OK - Venda Processando Corretamente, pois não recebemos na carga ainda"
      WHEN s.campaignId in (11099) and cs.product REGEXP "(Garantia Estendida Original (Ever Red))" and s.statusId = 2 THEN "OK - Venda Aprovada corretamente"
      WHEN s.campaignId in (11099) and cs.product NOT REGEXP "(Garantia Estendida Original (Ever Red))" and s.statusId = 3 THEN "OK - Venda Reprovada corretamente"
      WHEN s.statusId = 1 and cs.id is not null THEN "ERRO - Venda processando de forma errada, pois recebemos a venda na carga "
      ELSE "ERRO - Não Mapeado"
    END	AS ValidationQuery,DATEDIFF(NOW(),s.created)"Tempo criado",	
      s.id "Sale id",
     vr.validationPeriod, 
      s.statusId "Status ID",
      c.validationPeriod "Periodo de Validação",	
      c.companyId,
      statusSale.description "Sale Status",
      statusValidation.description "Val Status",
      statusDetailValidation.description "Val StatusDetail",
      statusDetailValidation.message "Va StatusDetail Message",
      CONCAT(c.id, " ", c.internalName) "Campanha",
      IF(cs.saleDate >= c.campaignStart  and cs.saleDate <= c.campaignEnd, "True",if(cs.id is null, "Não se aplica no momento", "False")) "Dentro do período da campaha?",
      cs.saleDate "Sale Date Cardif",
      s.created "Sale Date Registro",
      c.campaignStart "Inicio da Camkpanha",
      c.campaignEnd "Fim da Campanha",
      s.input "Sale Input",
      p.name "Product name",
      v.validationBatchId "Validation Lote",
      u.cpf "CPF",
      if(cu.eligible,
      "Elegível",
      "Não") "Usuário Elegível?",
      t.amount "Transaction",
      cs.id "id na PlayCardifsales",
      cs.input "Input encontrado",
      cs.created "Criação da carga",
      cs.product "Produto Cardif"
  from
      Sale s
  LEFT JOIN playground.CardifSales cs on
      LPAD(cs.input, 50, '0') = LPAD(s.input, 50, '0')
  left join Status statusSale on
      statusSale.id = s.statusId
  left join Campaign c on
      c.id = s.campaignId
  left join ProductCampaign pc on
      pc.id = s.productCampaignId
  left join Product p on
      p.id = pc.productId
  left join Validation v on
      v.sourceTypeId = 1
      and v.sourceId = s.id
  LEFT JOIN ValidationRule vr on vr.id = 92
  left join Status statusValidation on
      statusValidation.id = v.statusId
  left join StatusDetail statusDetailValidation on
      statusDetailValidation.id = v.statusDetailId
  left join Credit c2 on
      c2.validationId = v.id
  left join Transaction t on
      t.id = c2.transactionId
  left join Seller s2 on
      s2.id = s.sellerId
  left join User u on
      u.id = s2.userId
  left join Account a on
      a.id = u.accountId
  left join CampaignUser cu on
      cu.userId = u.id
      and cu.campaignId = c.id
  left join Sale sDuplicate on s.input = sDuplicate.input and s.id <>sDuplicate.id and sDuplicate.statusId <> 3 
  where
  c.internalName  REGEXP "(ducati)"
  -- s.campaignId in (11101,11102,11103,11104)-- and s.id in (2089007,2086942,2098610,2089020)
  GROUP BY s.id, statusSale.id, v.id, c2.id, cu.id, cs.id 
  HAVING ValidationQuery REGEXP "(-)"`, res)
   // console.log(res)
})


