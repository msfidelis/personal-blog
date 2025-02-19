---
layout: post
image: assets/images/system-design/deploy-logo.jpg
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design -  Deployment
---

O objetivo desse texto é abordar conceitualmente os principais termos que estão ao redor das técnicas de deployment e entrega de software. O objetivo não é apenas dizer "o que é" cada um dos termos e os modelos de deployment que eu considerei mais importantes, mas explicar o "por que" deles existirem e quais os reais benefícios da adoção dos mesmos. 

<br>

# Definindo um Deployment

O termo "deployment" vem de uma origem militar, onde os mesmos usavam para descrever o ato de disponibilizar tropas, recursos e equipamentos em locais estratégicos antes de iniciar as devidas operações. Dentro da engenharia de software o Deployment, ou implantação é um termo usado para designar o ato de disponibilizar uma versão de uma aplicação em um ambiente predefinido para ser testado, avaliado ou disponibilizado para os clientes utilizarem.

O deployment pode ser realizado com em diversos contextos e recursos, sendo para distribuir itens de infraestrutura, configurações e versões de aplicações novas ou já existentes. O deployment, quando realizado de forma moderna, é estruturado em dois momentos que podem coexistir por meio de pontes, que são o CI, Continuous Integration, ou Integração Contínua e o CD, Continuous Deployment, ou Deploy Contínuo. Vamos abordar cada um deles antes de prosseguir para os modos de deployment de fato. 

<br>

## Continuous Integration (Integração Contínua)

A Integração Contínua, ou Continuous Integration é a forma como empresas que trabalham seus projetos de software organizam e facilitam o trabalho em conjunto de seus desenvolvedores e demais profissionais de tecnologia. A ideia do CI, é prover uma série de processos e ferramentais que garantam que novas modificações na base de código sejam integradas de forma responsável e com a devida qualidade combinada. 

Cada vez que uma interação na base de código é feita,  essa modificação deve ser automaticamente testada e verificada em diversas dimensões, e caso esteja de fato funcionando e passe por todos os padrões combinados, consiga ser finalmente integrada a base oficial de código, garantindo que o que foi alterado não afeta fluxos e comportamentos que já existiam de forma prévia. Caso essa modificação quebre algum teste ou processo, o desenvolvedor responsáel precisa ser notificado de qual comportamento foi alterado sem intenção e de que forma isso ocorreu. Para isso existem alguns processos mais conhecidos que podemos categorizar para definirmos conceitualmente. 


### Testes de Unidade

Os testes de unidade, ou também popularmente conhecidos como Testes Unitários, são responsáveis por garantir comportamento de pequenas partes do código como funções, métodos e interfaces, inicialmente especificando suas entradas e testando suas saídas para garantir que tudo está sendo executado como o planejado. o executar esses testes a cada mudança, é possível identificar e corrigir problemas de forma rápida, evitando que erros simples se propaguem para áreas maiores do sistema.  


### Testes de Integração

Ao contrário dos testes unitários que buscam testar componentes de forma mais isolada possível, os testes integrados verificam como o sistema se comporta analisando componentes que se interagem entre si. Por exemplo, testar o request para um endpoint e testar seu retorno. Testar um client para algum serviço externo, realizando ou não o mock do mesmo e etc. Esse tipo de prática é um pouco mais custosa e demorada que os testes de unidade, mas tende a dar respostas bem importantes a respeito da mudança realizada, garantindo que nada parou de funcionar ou teve ser comportamento alterado de forma arbitrária. 

### Linters e Checagem de Sintaxe

Os linters são ferramentas que analisam o código gerado comparando o mesmo com uma série de padrões pré-definidos. Ao executar esse tipo de teste, garantimos que a nova modificação está aderente aos padrões de qualidade e estilo de codificação acordado na empresa, time ou contexto específico. Esse tipo de estratégia visa uma maior qualidade no ciclo de vida do produto, garantindo que todos os responsáveis pela alteração do código estão seguindo os mesmos padrões, mantendo o mesmo padronizado e legível.

### Análise Estática de Código

Diferente de testes que de alguma forma executam o código, o ferramental de análise estática examina a base sem executá-la, com o intuito de encontrar vulnerabilidade de código, problemas de performance, complexidade desnecessária e más práticas de implementação. A análise estática também pode ser extendida para análise de dependências, realizando as mesmas checagens nas bibliotecas e módulos utilizados, afim de encontrar os mesmos problemas e vulnerabilidades nelas. Esse tipo de prática é extremamente recomendada para evitar que versões comprometidas as nível de segurança sejam integradas ao ambiente de produção comprometendo o usuário final.

![CI](/assets/images/system-design/ci.drawio.png)

Dentro de um fluxo de trabalho realizado por meio do Git, entendemos que, num fluxo simplificado e ilustrativo, temos o desenvolvedor integrando uma nova feature a um sistema já existente. Esse desenvolvedor commita suas alterações em uma branch destinada a centralizar o trabalho realizado nessa nova funcionalidade, e a partir dos fluxos de Continuous integration nossas automações determinam se aquelas novas modificações estão aptas ou não a serem integradas na branch principal do projeto e posteriormente ser direcionada para o processo de release, ou Entrega Contínua. 

Fluxos de integração contínua mais modernos podem considerar realizar a construção dos artefatos a cada vez que branchs estratégias são modificadas. Além dos testes e validações, a aplicação construída e disponibilizada em algum local em espera para ser levada para a produção de forma mais fácil quando fizer sentido.  

<br>

## Continuous Deployment (Entrega Contínua)

O Continuous Deploy ou Entrega Contínua é o próximo passo após o processo de integração contínua. Após os testes serem executados e todo o fluxo básico de qualidade ser garantido, podemos considerar a nova versão do software integrado a algum ambiente, preferencialmente em produção. 

O CD busca reunir um ferramental capaz de realizar a construção dos artefatos, binários, executáveis e demais recursos e levá-los para algum ambiente no qual possa ser testado, validado ou utilizado de fato para os clientes da aplicação. Em processos de CI/CD modernos, o CD pode pular a fase de construção da aplicação quando esse passo é realizado com antecedência pelo fluxo de integração contínua e disponibilizado em registries de imagens, binários e afins. 

Dentro do processo de deployment contínuo **precisamos adicionar capacidades que permitam realizar validações de segurança, capacidade e detectar se aquela alteração gerou algum malefício arbitrário**. É nesse passo que aplicamos os modelos de deployment e de rollback nos quais vamos discorrer a frente. 

## Rollbacks de Versões

Muito mais importante que entregar rápido, é voltar a versão rápida em caso de detectarmos algum comportamento inesperado. O processo de rollback ocorre quando precisamos mediante a processos automatizados ou manuais, cancelar um deployment que ocorreu de alguma versão e retornar a uma versão antiga. São várias estratégias que podemos adotar para garantir uma excelência operacional que nos permita validar, promover ou retornar versões. A maturidade dos processos de rollback são inestimáveis para sistemas críticos, e devem estar atrelados a todos os tipos de modelos de deployment. 

<br>

# Estratégias de Deployments

Após explicar conceitualmente os principais componentes de um fluxo de integração e entrega contínua, podemos dar um passo a diante e explicar os principais modelos de deployment abstraídos de ferramentais, afim de não só explicar o "como" eles devem ser executados mas principalmente deixar claro o motivo pelos quais eles existem e que tipo de problemas cada um deles resolve, para que seja clara a análise de necessidades de cada especificidade de produto, e que os times de engenharia tenham a base sólida para decidir o melhor modelo para cada tipo de cenário.

## Rolling Updates

Os Rolling Updates são talvez o tipo mais comum de deployment. O modelo promove uma atualização gradual da versão de um mesmo serviço, subindo replicas e assim que estiverem estáveis matando sua versão anterior. Essa abordagem permite que o sistema continue operando, com parte das instâncias ainda rodando a versão antiga, enquanto outras já passam a utilizar a nova versão. 

Se uma aplicação possui 10 replicas, podemos configurar rolling updates que atualizem de uma em uma, duas em duas e etc. Assim que a nova replica estiver ativa e no ar, o fluxo de progressão continua e vai em diante até atingir 100% das replicas do sistema. 

Por mais que os Rolling Updates promovam um atualização escalonada, não ocorrem validações intermediárias entre as interações. Ou seja, o maximo de validação que ocorre de fato, é se as aplicações estão rodando e passaram em algum tipo de healthcheck. Não temos porcentagens controladas de direcionamento e nem temos formas de validar a versão nova de forma prévia. Esse tipo de problema requer abordagens com um pouco mais de estratégia e tecnologia envolvida. 

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

As **Data e Schema Migrations** são estratégias utilizadas para gerenciar mudanças em bancos de dados de forma segura, controlada e com o mínimo de impacto possível em aplicações em produção.

Elas são particularmente importantes em ambientes **cloud-native** e **distribuídos**, onde a atualização de dados e esquemas precisa ser feita de maneira gradual e resiliente.

Refere-se à alteração da estrutura do banco de dados, como adicionar, modificar ou remover tabelas, colunas, índices ou chaves.

Pode gerenciar à alteração dos próprios dados armazenados no banco de dados, como transformar, mover ou limpar registros.

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