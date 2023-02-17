require('dotenv').config({path: '../.env'})


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
   -- and s.id in (2029684,2029684,2029685,2029685,2029686,2029686,2029694,2029752,2029752,2029753)
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
      WHEN s.campaignId in (11099) and cs.product REGEXP "(Garantia Estendida Original).........." and s.statusId <> 2 THEN "ERRO - Produto Correto, mas a venda não foi aprovada ainda"
      WHEN s.campaignId in (11099) and cs.product NOT REGEXP "(Garantia Estendida Original).........." and s.statusId <> 3 THEN "ERRO - Produto incorreto, mas a venda não foi reprovada ainda"
      WHEN s.statusId = 1 and cs.id is null THEN "OK - Venda Processando Corretamente, pois não recebemos na carga ainda"
      WHEN s.campaignId in (11099) and cs.product REGEXP "(Garantia Estendida Original).........." and s.statusId = 2 THEN "OK - Venda Aprovada corretamente"
      WHEN s.campaignId in (11099) and cs.product NOT REGEXP "(Garantia Estendida Original).........." and s.statusId = 3 THEN "OK - Venda Reprovada corretamente"
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
  where
  c.internalName  REGEXP "(ducati)"
  -- s.campaignId in (11101,11102,11103,11104)-- and s.id in (2089007,2086942,2098610,2089020)
  GROUP BY s.id, statusSale.id, v.id, c2.id, cu.id, cs.id 
  HAVING ValidationQuery REGEXP "(-)"`, res)
 
})



app.get('/Metlife', (req, res) => {
    execSQLQuery(`SELECT vr.realm "APP" , 
    CASE 
        WHEN af.filterId = 15 and IF(af.negative,af.value REGEXP (u.cpf),af.value NOT REGEXP (u.cpf)) THEN "OK - Usuário não está na audiência da campanha"
        WHEN af.filterId = 1 and IF(af.negative,af.value REGEXP (s2.merchantId),af.value NOT REGEXP (s2.merchantId)) THEN "OK - Rede do usuário não está na audiencia da campanha"
        WHEN af.filterId = 4 and IF(af.negative,af.value REGEXP (s2.id),af.value NOT REGEXP (s2.id)) THEN "OK - Loja do usuário não está na audiencia da campanha"
        WHEN pss.id = 2 and ps.knownProductAliasId is not null THEN IF(ps.created >= DATE_ADD(NOW() , INTERVAL 0 DAY), "OK - Venda incluida hoje após processar o lote vai encontrar o alias","ERRO - Alias criado e encontrado, mas o status não foi atualizado")
        WHEN pss.id = 3 and u.invalid = 1 THEN "OK - Usuário indicado está com cadastro inativo"
        WHEN pss.id = 3 THEN IF(u.id is not null and u.created < DATE_ADD(NOW() , INTERVAL -1 DAY),"ERRO - Usuário está cadastrado no sistema", "OK - Usuário não está cadastrado no sistema ou se cadastrou hoje")
        WHEN pss.id = 9 THEN IF (GROUP_CONCAT(caMaster.id) is null, "OK - O produto não foi encontado em nenhuma campanha disponível dentro do período da Sale Date", "ERRO - Foi encontado campanha para esse produto")
        WHEN pss.id = 1 THEN IF(vr.validationPeriod <= DATEDIFF(NOW(), ps.created ), "OK - Venda adicionada recentemente","ERRO - Venda processando fora do prazo definido" )
        WHEN pss.id = 4 and GROUP_CONCAT(DISTINCT cu.id)  is not null and  GROUP_CONCAT(DISTINCT  cu.campaignUserStatusId) = 2 and GROUP_CONCAT(DISTINCT  cu.modified)  >= DATE_ADD(NOW() , INTERVAL -1 DAY) THEN "OK - Usuário aceitou a campanha recetemente, a venda será atualizada"
        WHEN pss.id = 4 and GROUP_CONCAT(DISTINCT cu.id)  is not null THEN IF(GROUP_CONCAT(DISTINCT cu.campaignUserStatusId) <> 2, " OK - Usuário não Aceitou a campanha", "ERRO - O usuário deu aceite na campanha" )
        WHEN pss.id = 4 and GROUP_CONCAT(DISTINCT cu.id)  is null THEN if(u.id = null, "ERRO - Usuário não está cadastrado", "OK - Usuário não acessou ainda dentro do período da campanha ")
        WHEN pss.id = 10 THEN IF(s.id is null, "OK - O usuário não adicionou uma loja", "ERRO - Usuário está com cadastro completo")
        WHEN pss.id = 10 THEN IF(s.id is null, "OK - O usuário não adicionou uma loja", "ERRO - Usuário está com cadastro completo")
        WHEN pss.id = 6 and pb.id  is not null and ic.purchaseDate >= pb.boostStart and ic.purchaseDate <= pb.boostEnd THEN IF(MAX(IF(rdd.rewardDistributionTargetId = 1, rdd.reward,null)) * pb.rate * sale.quantity = SUM(DISTINCT IF (rdd.rewardDistributionTargetId = 1 ,t.amount,NULL)),"OK - Venda Acelerada {86}", CONCAT("ERRO - Venda não acelerada corretamente. O usuário recebeu: ",ROUND(MAX(IF(rdd.rewardDistributionTargetId = 1, rdd.reward,null)) * pb.rate * sale.quantity - SUM(DISTINCT IF (rdd.rewardDistributionTargetId = 1 ,t.amount,NULL)),2),IF(MAX(IF(rdd.rewardDistributionTargetId = 1, rdd.reward,null)) * pb.rate * sale.quantity - SUM(DISTINCT IF (rdd.rewardDistributionTargetId = 1 ,t.amount,NULL)) < 0," a mais", " a menos"))) #Vai indicar se o usuário recebeu mais dinheiro que deveria ou menos
        WHEN pss.id = 6 and pb.id  is not null and ic.purchaseDate >= pb.boostStart and ic.purchaseDate <= pb.boostEnd THEN IF(MAX(IF(rdd.rewardDistributionTargetId = 1, rdd.reward,null)) * pb.rate * sale.quantity = SUM(DISTINCT IF (rdd.rewardDistributionTargetId = 1 ,t.amount,NULL)),"OK - Venda Acelerada {88}", CONCAT("ERRO - Venda não acelerada corretamente. O usuário recebeu: ",ROUND(MAX(IF(rdd.rewardDistributionTargetId = 1, rdd.reward,null)) * pb.rate * sale.quantity - SUM(DISTINCT IF (rdd.rewardDistributionTargetId = 1 ,t.amount,NULL)),2),IF(MAX(IF(rdd.rewardDistributionTargetId = 1, rdd.reward,null)) * pb.rate * sale.quantity - SUM(DISTINCT IF (rdd.rewardDistributionTargetId = 1 ,t.amount,NULL)) < 0," a mais", " a menos"))) #Vai indicar se o usuário recebeu mais dinheiro que deveria ou menos
        WHEN pss.id = 6 and SUM(DISTINCT IF (rdd.rewardDistributionTargetId = 1 ,t.amount,NULL)) = MAX(IF(rdd.rewardDistributionTargetId = 1, rdd.reward,null)) * sale.quantity THEN "OK - Venda Paga corretamente"
        WHEN pss.id = 6 and SUM(DISTINCT IF (rdd.rewardDistributionTargetId = 1 ,t.amount,NULL)) = MAX(IF(rdd.rewardDistributionTargetId = 1, rdd.reward,null)) * sale.quantity THEN "OK - Venda Paga corretamente"
        WHEN pss.id = 6 and v.created >= DATE_ADD(NOW() , INTERVAL - vr.paymentPeriod DAY) and SUM(t.amount) is null THEN "OK - Venda validada ainda recetemente"
        WHEN pss.id = 6 and SUM(t.amount) is null and mb.closed = 1 THEN "OK - Orçamento fechado"
        WHEN pss.id = 6 and SUM(t.amount) is null and mb.budget = mb.spend THEN "OK - Orçamento atingiu o limite"
        WHEN pss.id = 6 and SUM(DISTINCT SaldoFornecedor.a) <= 0 THEN "OK - O fornecedor não tem saldo disponível"
        WHEN ps.expirationDate < CURRENT_DATE() THEN "OK - A venda foi expirada e não será alterado pelo sistema." 
        WHEN vba.status NOT REGEXP "(Aprovado)" AND  SUM(t.amount) is null THEN CONCAT("OK - Lote de aprovação ainda não foi Aprovado pelo Cliente, verifique o lote: ", vbalr.validationBatchApproveId, ". Em CAMPANHAS > APROVAÇÃO DE PAGAMENTOS"  ) 
        WHEN vbalr.status NOT REGEXP "(Liberado)" and  SUM(t.amount) is null THEN  CONCAT("OK - Validation Aproved ainda não liberou o lote para aprovação do cliente. Status do Lote é: ", vbalr.status)
        WHEN pss.id = 6 and SUM(t.amount) is null THEN "ERRO - Usuário não recebeu pela venda aprovada"
        WHEN pss.id = 2 and kpa.id is null THEN "OK - Alias não criado para essa venda"
        WHEN pss.id = 5 THEN IF(s2.cnpj = ps.cnpj, "ERRO - Usuário está com o cnpj igual ao da PreSale", "OK - Usuário está cadastrado em um cnpj diferente do que veio na PreSale" )
        WHEN pss.id = 7 and sale.statusId = 2 THEN "ERRO - PreSale Cancelada, mas a Sale está aprovada"
        WHEN pss.id = 7 THEN GROUP_CONCAT("OK - ", ps.sellerKey) 
        WHEN pss.id = 6 THEN IF(SUM(DISTINCT  t.amount) = ps.reward, "OK - Venda paga com sucesso ", "ERRO - usuários não receberam") -- Não Paga vendedor, mas paga gerente	
        WHEN pss.id = 8 THEN "OK - Venda Duplicada"
        ELSE"ERRO - Não mapeado"
    END AS ValidationQuery, GROUP_CONCAT(cu.id),
  vr.description "Fornecido por",
  ps.id "presaleid", 
  ps.saleId "SaleId",
  vba.status "Status Validation Aproved",
  vbalr.status "Status ValidationAprovedLogReport", 
  pss.id "Presale Status ID",
  pss.description "PreSale Status Descrip", 
  ps.status "presaleStatus",
  ps.expirationDate "ExpirationDate",
  SUM(DISTINCT t.amount) "Soma Entregue",
  SUM(DISTINCT SaldoFornecedor.a) "Saldo disponível Fornecedor",
  SUM(DISTINCT  IF (rdd.rewardDistributionTargetId = 1 ,t.amount,NULL))  "Valor do Vendedor",
  SUM(DISTINCT  IF (rdd.rewardDistributionTargetId <> 1 ,t.amount,NULL))  "Valor do Superiores",
  ps.reward "presaleReward",
  ps.minReward "presaleMinReward",
  ps.productCode,
  ps.validationRuleId "ValidationRuleId",
  ps.sourceIdentification "SourceIdentification",
  ps.cpf "presaleCPF",
  ps.cnpj "Presale CNPJ",
  ps.productDescription "Presale Produto",
  ps.quantity "presale QTD",
  ps.saleDate "PreSale SaleDate",
  st.description "Status Desc",
  ca.id "Id da campanha",
  ca.internalName "Nome da campanha",
  std.description "Status Detail Desc",
  std.message "Status Detail Message",
  vr.description "Validation Rule Name",
  ps.validationBatchId "validationBatchId",
  v.statusId "statusId",
  v.statusDetailId "statusDetailId",
  se.sellerKey "Seller Key",
  ps.sellerKey "PS.Seller Key",
  GROUP_CONCAT(DISTINCT cs.key) "CStore Key",
  ps.created "Datadeinclusão",
  kpa.id "ID Alias",
  kpa.matchDescription "Descript Alias",
  GROUP_CONCAT(DISTINCT p.name)"Produto Vinculado",
  #PreSaleDuplicate.id "PreSale duplicada",
  u.id "Id do usuário",
  u.cpf "CPF do usuário",
  u.created "Criado em",
  GROUP_CONCAT(DISTINCT kpp.productId) "Produto ID",
  GROUP_CONCAT(DISTINCT caMaster.id ) "Campanha Master vinculada a data e o produto",
  GROUP_CONCAT(DISTINCT "{",caMaster.campaignStart,"}") 
FROM  PreSale                              ps
  LEFT JOIN PreSaleStatus                  pss on pss.id = ps.preSaleStatusId
  LEFT JOIN Sale                           sale on ps.saleId = sale.Id
  LEFT JOIN Seller                         se on se.id = sale.sellerId #Seller da venda
  LEFT JOIN Status                         st on st.id = sale.statusId
  LEFT JOIN Campaign                       ca on ca.id = sale.campaignId
  LEFT JOIN Validation                     v on v.sourceTypeId = 1  and v.sourceId = sale.id
  LEFT JOIN prod_icv_db.StatusDetail       std on std.id = v.statusDetailId
  LEFT JOIN ValidationRule                 vr on vr.id = ps.validationRuleId
  LEFT JOIN CustomStore                    cs on cs.cnpj = ps.cnpj
  LEFT JOIN Company                        c3 ON ca.companyId = c3.id 
  LEFT JOIN KnownProductAlias              kpa ON kpa.id = ps.knownProductAliasId 
  LEFT JOIN KnownProduct                   kp ON kp.id = kpa.knownProductId 
  LEFT JOIN KnownProductProduct            kpp ON kpp.knownProductId = kp.id 
  LEFT JOIN User                           u ON u.cpf = ps.cpf and u.realm = vr.realm 
  LEFT JOIN Seller                         uss on uss.userId = u.id #Seller do Usuários
  LEFT JOIN Store s2                       ON s2.id = uss.storeId  #Loja do usuário
  LEFT JOIN Store                          s ON s.userId = u.id 
  LEFT JOIN Product                        p ON p.id = kpp.productId 
  LEFT JOIN ProductCampaign                pc ON p.companyId IN (10373) AND p.id = pc.productId 
  LEFT JOIN Campaign                       caMaster ON ps.saleDate >= caMaster.campaignStart and ps.saleDate <= caMaster.campaignEnd  and caMaster.id = pc.campaignId #Campanha Master é a campanha vinculada ao produto e não a venda, estamos procurando campanhas criadas que tem esses produtos.
  LEFT JOIN CampaignUser                   cu ON cu.userId = u.id and caMaster.id = cu.campaignId 
  LEFT JOIN ProductBoost                   pb ON pb.id  = sale.productBoostId 
  LEFT JOIN Invoice                        i  ON sale.id = i.saleId 
  LEFT JOIN InvoiceCheck                   ic ON i.id = ic.invoiceId 
  LEFT JOIN Credit                         c2 ON c2.validationId = v.id 
  LEFT JOIN Transaction                    t ON c2.transactionId = t.id 
  LEFT JOIN RewardDistributionDetail       rdd ON c2.rewardDistributionDetailId = rdd.id
  LEFT JOIN MonthlyBudget                  mb on v.monthlyBudgetId = mb.id 
  LEFT JOIN Audience                       a on a.id = ca.audienceId 
  LEFT JOIN AudienceFilter                 af on af.audienceId = a.id 
  LEFT JOIN ValidationBatchApproveLogReport vbalr on vbalr.preSaleId = ps.id 
  LEFT JOIN ValidationBatchApproveItem      vbai on vbai.preSaleId = ps.id 
  LEFT JOIN ValidationBatchApprove          vba on vba.id = vbai.validationBatchApproveId 
  LEFT JOIN (
          SELECT 
              SUM(IF(t.transactionTypeId = 5 ,t.amount,NULL))-SUM(IF(t.transactionTypeId = 4 ,t.amount,NULL)) a, t.accountId b
            FROM Transaction t 
            WHERE t.accountId = 119761
        ) SaldoFornecedor ON SaldoFornecedor.b = 119761
      WHERE true		  	
      and ps.validationRuleId IN (84) and ps.expirationDate >= NOW() 
     -- AND sale.id = 2201178
      -- and ps.cpf = 87335190304 
   #	AND af.filterId in (1,15)
GROUP by pss.id, sale.id, se.id, st.id, ca.id, v.id, std.id, vr.id, c3.id , u.id, ps.id, s.id, pb.id,ic.id, mb.id, af.id, a.id, vba.status, vbalr.status 
Having ValidationQuery REGEXP "(-)"	`, res)
 
})
// Validação De Saldo e Lotes
app.get("/ValidationBudget/:id", function(req,res){
    let CompanyID = req.params.id
    execSQLQuery(`SELECT DISTINCT vb.id, vb.monthlyBudgetId, vb.description ,mb.closed, mb.budget, mb.spend, mb.year, mb.month,  SUM(rdd.reward) "SomaValorPorLote", IF((SUM(rdd.reward) + mb.spend) < mb.budget and mb.closed = false, "Disponível","Indisponível") "OrçamentoDisponivel", IF(SUM(DISTINCT a.currentBalance) >  SUM(rdd.reward), "Disponível","Indisponível") "SaldoDisponivel", a.currentBalance, a.name
FROM ValidationBatch vb 
INNER JOIN Company c2 ON c2.id = vb.companyId 
INNER JOIN Account a ON a.id = c2.accountId 
Inner JOIN Validation v on v.validationBatchId = vb.id 
Inner JOIN Sale s on s.id = v.sourceId
LEFT JOIN Campaign c on c.id = s.campaignId 
LEFT JOIN ProductCampaign pc on pc.campaignId = c.id 
LEFT JOIN ProductCampaignRewardDistribution pcrd on pcrd.productCampaignId = pc.id 
LEFT JOIN RewardDistributionDetail rdd on rdd.rewardDistributionId = pcrd.rewardDistributionId 
LEFT JOIN MonthlyBudget mb on mb.id = vb.monthlyBudgetId 
INNER JOIN StatusDetail sd2 on sd2.id = v.statusDetailId 
LEFT JOIN PreSale ps on ps.saleId = s.id 
LEFT JOIN ValidationBatchApproveLogReport vbalr on vbalr.preSaleId = ps.id 
LEFT JOIN ValidationBatchApproveItem vbai on vbai.preSaleId = ps.id 
LEFT JOIN ValidationBatchApprove vba on vba.id = vbai.validationBatchApproveId 
WHERE s.statusId = 1  
and sd2.statusId = 2
and IF(c2.id <> 10373, TRUE, vba.status REGEXP"(Aprovado)")
and IF(c2.id <> 10373, TRUE,vbalr.status REGEXP "(Liberado)")
and rdd.id is not null
and c2.id = ${CompanyID}
GROUP BY vb.id `,res)
})

// GetCompany
app.get("/Company", function(req,res){
    let IDFilter = req.params.id
    execSQLQuery(
        `SELECT*
        FROM Company c 
        WHERE c.enabled = true
        AND c.accountId is not null`
    ,res)
   
})




// Zona de Teste API
app.get("/Teste/:id", function(req,res){
    let IDFilter = req.params.id
    execSQLQuery(
        `SELECT *
        from Account a 
        INNER JOIN Company c on c.accountId = a.id 
        WHERE TRUE 
        AND a.id = ${IDFilter}`
    ,res)
   
})