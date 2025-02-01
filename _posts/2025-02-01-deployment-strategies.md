---
layout: post
image: assets/images/system-design/deploy-logo.jpg
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design -  Deployment
---

# Definindo um Deployment

O termo "deployment" vem de uma origem militar, onde os mesmos usavam para descrever o ato de disponibilizar tropas, recursos e equipamentos em locais estratégicos antes de iniciar as devidas operações. Dentro da engenharia de software o Deployment, ou implantação é um termo usado para designar o ato de disponibilizar uma versão de uma aplicação em um ambiente predefinido para ser testado, avaliado ou disponibilizado para os clientes utilizarem.

O deployment pode ser realizado com em diversos contextos e recursos, sendo para distribuir itens de infraestrutura, configurações e versões de aplicações novas ou já existentes. 

## Continuous Integration (Integração Contínua)

## Continuous Deployment (Entrega Contínua)

## Rollbacks de Versões

<br>

# Estratégias de Deployments

## Rolling Updates

## Big Bang Deployments

## Blue-Green Deployments 

O Blue/Green Deployment é uma estratégia de deployment que vista buscar o "zero downtime" durante releases de novas versões, e garantir o rollback rápido caso necessário, garantindo alta disponibilidade durante o rollout de novas versões. 

O modelo Blue/Green tem essa denominação pois se consiste em disponibilizar dois ambientes “identicos", divergindo apenas sobre a versão do componente que foi atualizado, onde o termo “Blue” é utilizado para identificar a versão estável que está em uso produtivo e sendo consumida pelos usuários do sistema e o termo “Green” é utilizado para identificar a versão mais recente, candidata para substituir a versão estável. 

Esse tipo de abordagem permite que testes sejam executados na nova versão sem atrapalhar o fluxo produtivo, tornando possível a execução de warm-ups das replicas, realizar [smoke testes] e validações automáticas ou manuais antes da versão ser promovida, garantindo maiores níveis de segurança no processo. 

Quando a nova versão “Green” está pronta e testada, o tráfego de produção é redirecionado do ambiente Blue para o Green. Esse redirecionamento geralmente ocorre de forma instantânea, utilizando um [Load Balancer]() ou um mecanismo de [Roteamento de DNS]().

É comum que o ambiente “Blue” anterior, fique ativo por um certo tempo para garantir um retorno mais rápido em caso de eventual falha não coberta por testes anteriores. Se houver algum problema na nova versão, o tráfego pode ser rapidamente revertido para o ambiente, minimizando o impacto que aquela release teria para os usuários.

Em contrapartida, manter um ambiente blue/green por muito tempo pode ser considerado caro, principalmente em sistemas grandes e complexos. 

O principal desafio não está na gestão da versão do software em si, mas em realizar migrações e atualizações de esquemas de dados. A sincronização da versões de schema, tendem a ser a parte mais complexa de qualquer deployment moderno, principalmente para realizar a gestão do rollback. Realizar a migração de schema que quebre a versão Blue não é tão incomum, e realizar o rollback em caso de falha também tende a ser extremamente custoso e trabalhoso.

## Canary Releases

O Canary Release, ao contrário do Blue/Green que busca uma implantação direta após certas validações prévias, é um processo de implantação gradual, onde mantemos duas versões da mesma aplicação no ar, mas apenas uma pequena porcentagem do tráfego ou clientes são direcionados para a nova release. No mais, o tráfego de produção é dividido entre a versão antiga da aplicação (chamada de **stable**) e a nova versão (chamada de **canary**).

O Canary release busca ir incrementando porcentagens seguras de tráfego para os clientes, afim de testar a versão canary com partes do tráfego real que são aumentadas gradativamente em períodos de tempo, ou após determinadas validações. É importante que mecanismos de rollback sejam criados para que o canary seja cancelado e a versão anterior restaurada a qualquer momento, por vias manuais ou por decisão de algum mecanismo de validação.  Após a confirmação de que a nova versão está estável, segura e funcionando conforme os critérios estabelecidos previamente, todo o tráfego de produção é direcionado para ela, substituindo a versão antiga. Dessa forma promovemos a versão Canary para Stable, e damos lugar para o próximo rollout. 

Mais importante do que progredir a porcentagem do canary rápido, é poder realizar o rollback rápido. Durante o período em que o Canary Release está em operação, métricas importantes podem ser monitoradas para verificar se está tudo ocorrendo bem, como latência, taxa de erros, métricas customizadas que reflitam a operação do produto e etc. A importância dessas métricas como indicadores facilitam que a progressão e o rollback do canary seja realizada de forma automática.

## Migrations e Versionamento de Schemas

## Shadow Deployment e Mirror Traffic

O Shadow Traffic é uma estratégia moderna de validação de novas versões, onde a ideia se consiste em enviar a cópia de uma porcentagem do tráfego para uma nova versão temporária e limitada para testar o comportamento dessa aplicação ou infraestrutura.

Esse tráfego por sua vez é processado inteiramente pela nova aplicação, porém sua resposta não é enviada para o cliente. Tudo que for espelhado, não deve afetar de nenhuma forma a experiência do cliente.  No Traffic Mirroring, a duplicação de tráfego ocorre em tempo real e normalmente é configurada em níveis mais baixos, como no proxys reversos, sidecars ou service meshes que atuam adiconando comportamentos direto na camada de networking.

Esse modelo casa perfeitamente em aplicações que não escrevem dados de fato, pois espelhar o tráfego por si só acarretaria em duplicar registros e ocasionar inconsistências na camada de dados. Uma solução pra isso é o ambiente shadow rodar em modelo de “dry-run", onde por certas implementações, todo o fluxo é executado, porém nada é de fato commitado e confirmado dentro das transações. Isso permite validar uma grande parte da experiência da aplicação, sem gerar efeitos adversos.

Essa deployment limitado pode ser analisado por meio de métricas logs antes do time tomar alguma decisão de progredir o deployment. A grande vantagem é que essa estratégia pode ser combinada tanto para Blue/Green quanto para Canary Releases. 

Um shadow deployment com mirror traffic pode iniciar antes do Canary Release ou do Blue/Green tendo uma pré-validação antes de promover qualquer versão para o cliente ou provisionamento mais brusco de infraestrutura.

## Feature Flags

As Feature Flags ou Feature Toggles são técnicas que permitem realizar o rollout de novas features de forma controlada, permitindo dinamicamente ativar ou desativar certas funcionalidades sem a necessidade de alterar o código fonte e realizar novos deployments. Para criar a funcionalidade, é necessários sim um deployment, mas a disponibilização dessa funcionalidade é entregue com a flag desligada. Conforme são levantados os clientes elegíveis a experimentarem certos tipos de flags, a determinada funcionalidade é habilitada de forma controlada. 

Elas são utilizadas para durante gestão de lançamentos, controle de funcionalidades em produção e experimentação controlada, como por exemplo habilitar uma nova versão da tela de um sistema apenas para uma pequena porcentagem de usuários, enquanto monitora feedback dos mesmos e compara as métricas com usuários que utilizam a versão antigas.

Feature Flags precisam de componentes centralizados que controlem a distribuição das features, podendo ser ferramentas conhecidas de mercado como backoffices administrativos que alteram flags em determinadas bases de dados e etc . 

Sistemas que consigam agrupar clientes por segmentos, como por exemplo segregar grupos de clientes que são Pessoa Física e de Pessoa Jurídica, ou de segmentos que são do Varejo, Agropecuária, Mídia, Assinaturas, Serviços podem ser mapeados e segregados sistemicamente, e por meio das feature flags experimentar funcionalidades de forma controlada entre eles. 

O uso das feature flags podem ser estendidos para times de negócio e produto, que podem controlar a validação com seus clientes sem o envolvimento dos times de engenharia diretamente.

## Sharding Deployment