---
layout: post
image: assets/images/system-design/deploy-logo.jpg
featured: false
published: true
categories: [system-design, engineering, cloud]
title: System Design -  Deployment
---

O objetivo desse texto é abordar conceitualmente os principais termos que estão ao redor das técnicas de deployment e entrega de software. O objetivo não é apenas dizer "o que é" cada um dos termos e os modelos de deployment que eu considerei mais importantes, mas explicar o "por que" deles existirem e quais os reais benefícios da adoção dos mesmos.

<br>

# Definindo um Deployment

O termo "deployment" vem de uma origem militar, onde os mesmos usavam para descrever o ato de disponibilizar tropas, recursos e equipamentos em locais estratégicos antes de iniciar as devidas operações. Dentro da engenharia de software o Deployment, ou implantação é um termo usado para designar o ato de disponibilizar uma versão de uma aplicação em um ambiente predefinido para ser testado, avaliado ou disponibilizado para os clientes utilizarem.

O deployment pode ser realizado com em diversos contextos e recursos, sendo para distribuir itens de infraestrutura, configurações e versões de aplicações novas ou já existentes. O deployment, quando realizado de forma moderna, é estruturado em dois momentos que podem coexistir por meio de pontes, que são o CI, Continuous Integration, ou Integração Contínua e o CD, Continuous Deployment, ou Deploy Contínuo. Vamos abordar cada um deles antes de prosseguir para os modos de deployment de fato.

<br>

## Continuous Integration (Integração Contínua)

A **Integração Contínua** ou **Continuous Integration**, é a forma como as empresas que trabalham com projetos de software organizam e facilitam o trabalho em conjunto de seus desenvolvedores e demais profissionais de tecnologia. A ideia do **CI** é prover uma série de processos e ferramentas que garantam que novas modificações na *****base de código** sejam integradas de forma responsável e com a devida qualidade.

Cada vez que uma **interação na base de códigoé realizada, essa modificação deve ser automaticamente testada e verificada em diversas dimensões** . Caso esteja funcionando corretamente e atenda a todos os padrões estabelecidos, ela pode ser finalmente integrada à base oficial de código, garantindo que o que foi alterado não afete fluxos e comportamentos pré-existentes. Se essa modificação quebrar algum teste ou processo, o desenvolvedor **responsável** precisa ser notificado sobre qual comportamento foi alterado indevidamente e de que forma isso ocorreu. Para isso, existem alguns processos mais conhecidos que podemos categorizar para definirmos os conceitos.


![CI](/assets/images/system-design/ci.drawio.png)

Dentro de um fluxo de trabalho realizado por meio do Git, podemos entender, de forma simplificada e ilustrativa, que **o desenvolvedor integra uma nova feature a um sistema já existente**. Esse desenvolvedor realiza o commit de suas alterações em uma branch destinada a centralizar o trabalho nessa nova funcionalidade. **A partir dos fluxos de Continuous Integration, as automações determinam se as novas modificações estão aptas ou não a serem integradas à branch principal** do projeto e, posteriormente, direcionadas para o processo de release ou Entrega Contínua.

Fluxos de integração contínua mais modernos podem considerar a construção de artefatos sempre que branches estratégicas são modificadas. Além dos testes e validações, a aplicação construída pode ser disponibilizada em um local específico, aguardando para ser promovida à produção de forma mais fácil e ágil quando fizer sentido.


### Testes de Unidade

Os testes de unidade, ou também popularmente conhecidos como estes unitários, são responsáveis por garantir o comportamento de pequenas partes do código como funções, métodos e interfaces, inicialmente **especificando suas entradas e testando suas saídas para garantir que tudo está sendo executado como o planejado**. o executar esses testes a cada mudança, é possível identificar e corrigir problemas de forma rápida, evitando que erros simples se propaguem para áreas maiores do sistema.


### Testes de Integração

Ao contrário dos testes unitários que buscam testar componentes de forma mais isolada possível, **os testes de integração verificam como o sistema se comporta analisando componentes que interagem entre si**. Por exemplo, testar uma requisição para um endpoint e validar seu retorno, ou testar um cliente de um serviço externo, com ou sem o uso de mocks. **Esse tipo de teste é um pouco mais custoso e demorado do que os testes unitários, mas tende a fornecer respostas importantes sobre as mudanças realizadas**, garantindo que nada deixou de funcionar ou teve seu comportamento alterado de forma inesperada.


### Linters e Checagem de Sintaxe

Os **linters são ferramentas que analisam o código comparando-o com uma série de padrões predefinidos**. Ao executar esse tipo de verificação, **garantimos que a nova modificação está aderente aos padrões de qualidade e estilo de codificação acordados na empresa, no time ou em um contexto específico**. Essa estratégia busca aumentar a qualidade no ciclo de vida do produto, assegurando que todos os responsáveis pelas alterações no código sigam os mesmos padrões, mantendo-o padronizado e legível.


### Análise Estática de Código

Diferentemente dos testes que executam o código de alguma forma, as **ferramentas de análise estática examinam a base sem executá-la, com o intuito de identificar vulnerabilidades no código, problemas de desempenho, complexidade desnecessária e más práticas de implementação**. A análise estática **também pode ser estendida para a análise de dependências**, realizando as mesmas verificações em bibliotecas e módulos utilizados, a fim de identificar os mesmos problemas e vulnerabilidades. Essa prática é **altamente recomendada para evitar que versões comprometidas em termos de segurança** sejam integradas ao ambiente de produção, prevenindo riscos para o usuário final.


<br>

## Continuous Deployment (Entrega Contínua)

O Continuous Deployment (CD), ou Entrega Contínua, é o próximo passo após o processo de integração contínua. **Após a execução dos testes e a garantia do fluxo básico de qualidade, podemos considerar a nova versão do software integrada a algum ambiente, preferencialmente em produção.**

O CD busca reunir um conjunto de ferramentas capazes de realizar a construção de artefatos, binários, executáveis e demais recursos, levando-os a um ambiente onde possam ser testados, validados ou utilizados pelos clientes da aplicação. Em processos modernos de CI/CD, o CD pode pular a fase de construção da aplicação caso esse passo já tenha sido realizado previamente pelo fluxo de integração contínua e disponibilizado em registries de imagens, binários e outros artefatos.

Dentro do processo de deployment contínuo, **é essencial incluir mecanismos que permitam validar segurança, capacidade e detectar possíveis impactos negativos inesperados**. É nesse estágio que aplicamos os modelos de deployment e rollback, os quais discutiremos adiante.


## Rollbacks de Versões

**Mais importante do que entregar rapidamente é conseguir reverter uma versão com agilidade caso um comportamento inesperado seja detectado**. O processo de rollback ocorre quando, por meio de processos automatizados ou manuais, precisamos cancelar um deployment e retornar a uma versão anterior. 

Existem diversas estratégias que podem ser adotadas para garantir excelência operacional, **permitindo validar, promover ou reverter versões de forma eficiente**. A maturidade dos processos de rollback é fundamental para sistemas críticos e deve estar integrada a todos os modelos de deployment.
t.

<br>

# Estratégias de Deployments

Após explicar conceitualmente os principais componentes de um fluxo de integração e entrega contínua, podemos avançar para a explicação dos principais modelos de deployment, abstraídos de ferramentas específicas. O objetivo não é apenas detalhar **como** eles devem ser executados, mas, principalmente, esclarecer **por que** existem e quais tipos de problemas cada um resolve. 

Isso permitirá uma análise clara das necessidades de cada produto, garantindo que os times de engenharia tenham uma base sólida para decidir o melhor modelo de deployment para cada cenário.


## Rolling Updates

Os Rolling Updates são, possivelmente, o tipo mais comum de deployment. **Esse modelo promove uma atualização gradual da versão de um serviço, iniciando novas réplicas e, assim que estiverem estáveis, desligando as versões anteriores**. Essa abordagem permite que o sistema continue operando, com parte das instâncias ainda executando a versão antiga, enquanto outras já utilizam a nova versão.

Se uma aplicação possui 10 réplicas, podemos configurar os Rolling Updates para atualizar uma a uma, duas a duas e assim por diante. Assim que a nova réplica estiver ativa e operando corretamente, o fluxo de progressão continua até que 100% das réplicas tenham sido atualizadas.

![Rolling Update](/assets/images/system-design/rolling-update.drawio.png)

Embora os Rolling Updates promovam uma atualização escalonada, **não há validações intermediárias entre as interações**. Ou seja, a única verificação realizada é se as aplicações estão em execução e passaram por um health check básico. **Não há controle refinado sobre o direcionamento do tráfego nem mecanismos para validar previamente a nova versão**. Esse tipo de limitação pode exigir abordagens mais estratégicas e com um maior nível de tecnologia envolvida.

## Big Bang Deployments

Os Big Bang Deployments, ou Recreate Deployments, são **estratégias que recriam todo o sistema de forma abrupta e simultânea**. Embora essa abordagem possa parecer brusca e drástica, **ela se torna necessária em cenários onde não é possível, de forma alguma, conviver com duas versões simultâneas do mesmo sistema** ou quando uma transição gradual seria mais prejudicial do que uma indisponibilidade temporária até a reestabilização do serviço.

![Big Bang Deployment](/assets/images/system-design/big-bang.drawio.png)

Esse tipo de estratégia pode ser necessário em aplicações que utilizam padrões de **leasing**, como consumidores de Kafka, onde a constante alternância de consumidores em um tópico pode gerar operações de rebalanceamento, afetando significativamente a performance do consumo. **Nesses casos, a recriação total do sistema pode ser mais viável do que uma atualização progressiva**. Além disso, esse modelo pode ser útil quando há necessidade de trocar esquemas de banco de dados ou modificar contratos de comunicação.

Esse padrão só deve ser considerado viável quando as aplicações envolvidas adotam modelos de [comunicação assíncrona](/mensageria-eventos-streaming/) e operam com [consistência eventual](/teorema-cap/).

Vale ressaltar que essa abordagem deve ser utilizada apenas como último recurso, seja nos exemplos citados ou em outros contextos, sempre com muito cuidado e parcimônia. Embora operacionalmente seja mais simples por não exigir mecanismos de controle para progressão e validação, ela adiciona um alto nível de risco para o cliente.


## Blue-Green Deployments

O Blue/Green Deployment é uma estratégia de deployment que vista buscar o **"zero downtime"** **durante releases de novas versões, e garantir o rollback rápido caso necessário**, garantindo alta disponibilidade durante o rollout de novas versões.

O modelo Blue/Green é uma estratégia que permite realizar releases de novas versões com segurança e garantir um rollback rápido caso necessário, assegurando alta disponibilidade durante o rollout de novas versões.

Esse modelo recebe essa denominação porque **consiste em disponibilizar dois ambientes idênticos, divergindo apenas na versão do componente atualizado**. O termo **“Blue” identifica a versão estável que está em uso produtivo**, sendo consumida pelos usuários do sistema, enquanto o termo **“Green” representa a versão mais recente, candidata a substituir a versão estável**.

![Blue/Green](/assets/images/system-design/blu-green.drawio.png)

Essa abordagem **permite que testes sejam executados na nova versão sem impactar o fluxo produtivo, tornando possível a execução de warm-ups das réplicas**, a realização de [smoke tests](/load-testing/) e a aplicação de validações automáticas ou manuais antes da promoção da versão, garantindo maior segurança no processo.

Quando a nova versão “Green” está pronta e testada, o tráfego de produção é redirecionado do ambiente Blue para o Green. Esse redirecionamento geralmente ocorre de forma instantânea, utilizando um [Load Balancer](/load-balancing/) ou um mecanismo de [Roteamento de DNS](/protocolos-de-rede/).

É comum que o ambiente Blue anterior **permaneça ativo por um tempo para garantir um retorno rápido em caso de falha não detectada nos testes anteriores**. Se algum problema for identificado na nova versão, **o tráfego pode ser rapidamente revertido para o ambiente Blue, minimizando o impacto da release para os usuários**.

![Blue/Green Workflow](/assets/images/system-design/blue-green-workflow.drawio.png)

Para tirar o maior proveito possível do modelo Blue/Green, **é essencial utilizar mecanismos que permitam realizar testes com segurança antes da promoção para os clientes finais**. Dessa forma, podemos **garantir, de forma manual ou automatizada, que as principais funcionalidades estão operando corretamente e que nenhum limite de erros ou tempos de resposta foi excedido na nova versão**.

Por outro lado, manter um ambiente Blue/Green por longos períodos pode ser oneroso, especialmente em sistemas grandes e complexos.

O principal desafio desse modelo **não está na gestão da versão do software em si, mas na migração e atualização de esquemas de dados**. A sincronização entre versões de schema tende a ser a parte mais complexa de qualquer deployment moderno, especialmente no que diz respeito à gestão de rollback. Alterações no schema que tornem a versão Blue incompatível não são incomuns, e reverter essas mudanças em caso de falha pode ser um processo extremamente custoso e trabalhoso.


## Canary Releases

O Canary Release, ao contrário do Blue/Green, que busca uma implantação direta após certas validações prévias, **é um processo de implantação gradual, no qual mantemos duas versões da mesma aplicação em operação, mas apenas uma pequena porcentagem do tráfego ou dos clientes é direcionada para a nova release**. O tráfego de produção é dividido entre a versão antiga da aplicação (chamada de **stable**) e a nova versão (chamada de **canary**).

![Canary Releases](/assets/images/system-design/canary.drawio.png)

O Canary Release **incrementa porcentagens seguras de tráfego para a nova versão**, a fim de **testar a versão canary com parte do tráfego real**, aumentando essa participação gradualmente ao longo do tempo ou após determinadas validações. É fundamental que mecanismos de rollback sejam implementados, permitindo que o **canary seja cancelado e a versão anterior restaurada a qualquer momento, seja manualmente ou por decisão de um mecanismo de validação automatizado**. Após a confirmação de que a nova versão está estável, segura e atendendo aos critérios estabelecidos, todo o tráfego de produção é direcionado para ela, substituindo a versão antiga. **Dessa forma, promovemos a versão Canary para Stable e preparamos o ambiente para o próximo rollout**.

![Canary Releases](/assets/images/system-design/canary-workflow.drawio.png)

A maneira mais moderna e eficiente de orquestrar a progressão do tráfego no canary **é associar o aumento das porcentagens a checagens de métricas, alertas e testes sintéticos** que podem ser executados durante o deploy para validar se o processo está ocorrendo de forma segura.

Mais **importante do que acelerar a progressão do canary é garantir a possibilidade de rollback rápido**. Durante o período em que o Canary Release está em operação, **métricas essenciais podem ser monitoradas para verificar se tudo está ocorrendo conforme esperado, incluindo latência, taxa de erros e métricas customizadas que reflitam a operação do produto**. A importância dessas métricas como indicadores facilita a automação tanto da progressão quanto do rollback do canary, garantindo segurança e confiabilidade no processo.


## Migrations e Versionamento de Schemas

As **Data e Schema Migrations** são estratégias utilizadas para gerenciar mudanças em bancos de dados de forma segura, controlada e com o mínimo de impacto possível em aplicações em produção.

Elas são particularmente importantes em ambientes **cloud-native** e **distribuídos**, onde a atualização de dados e esquemas precisa ser feita de maneira gradual e resiliente.

Refere-se à alteração da estrutura do banco de dados, como adicionar, modificar ou remover tabelas, colunas, índices ou chaves.

Pode gerenciar à alteração dos próprios dados armazenados no banco de dados, como transformar, mover ou limpar registros.

## Shadow Deployment e Mirror Traffic

O Shadow Deploy, também conhecido como Versão de Sombra, Mirror Traffic ou Shadow Traffic, **é uma estratégia avançada de validação de novas versões**. A ideia consiste em enviar **uma cópia de uma porcentagem do tráfego para uma nova versão temporária e limitada**, permitindo testar o comportamento da aplicação ou da infraestrutura sem impactar os usuários.

![Shadow Traffic](/assets/images/system-design/Scale-Shadow.drawio.png)

Esse tráfego é processado inteiramente pela nova aplicação, **porém, sua resposta não é enviada para o cliente**. **Tudo o que for espelhado não deve afetar, de nenhuma forma, a experiência do usuário**. No Traffic Mirroring, **a duplicação do tráfego ocorre em tempo real e normalmente é configurada em camadas mais baixas, como proxies reversos, sidecars ou service meshes**, que adicionam esse comportamento diretamente na camada de rede.

Nesse processo, **uma parte do tráfego real é duplicada e enviada para uma versão alternativa do sistema, que processa as requisições em paralelo, mas sem retornar os resultados para os clientes**. É importante ressaltar que esse tráfego **é duplicado, e não dividido**, garantindo que as requisições sejam direcionadas para a nova versão sem interferir na produção. Isso permite que a versão prévia seja analisada antes de iniciar a progressão para outras estratégias de deployment, como Canary e Blue/Green, funcionando como um passo anterior ao início do deployment real. Dependendo do contexto, essa abordagem pode ser combinada com qualquer uma das estratégias já abordadas.

Esse modelo se encaixa perfeitamente em aplicações que não realizam operações de escrita, pois espelhar o tráfego diretamente poderia resultar na duplicação de registros e gerar inconsistências na camada de dados. **Uma solução para esse problema é executar o ambiente shadow no modo “dry-run”, onde todo o fluxo é simulado, mas sem que nenhuma operação seja efetivamente commitada ou confirmada dentro das transações**. Isso possibilita a validação de grande parte da experiência da aplicação sem causar efeitos adversos.


```go
if os.Getenv("ENVIRONMENT") == "shadow" {
    tx.Rollback()
} else {
    tx.Commit()
}
```

Esse deployment limitado pode ser **analisado por meio de métricas e logs antes que o time tome uma decisão sobre a progressão do deployment**. A grande vantagem dessa estratégia é que ela pode ser combinada tanto com Blue/Green quanto com Canary Releases.

Um shadow deployment com mirror traffic pode ser iniciado antes do Canary Release ou do Blue/Green, permitindo uma pré-validação antes de promover qualquer versão para os clientes ou realizar um provisionamento mais agressivo de infraestrutura.

Outro ponto crucial a ser considerado é a **idempotência, tanto dentro quanto fora da capacidade de dry-run e da versão de sombra**, para evitar duplicidades ou operações adicionais inesperadas.


## Feature Flags

As Feature Flags, ou Feature Toggles, são **técnicas que permitem o rollout de novas funcionalidades de forma controlada, possibilitando a ativação ou desativação dinâmica de certas features sem a necessidade de alterar o código-fonte ou realizar novos deployments**. Para que a funcionalidade esteja disponível, é necessário um deployment, porém, **sua liberação ocorre com a flag desligada**. À medida que determinados clientes são selecionados para experimentar a nova funcionalidade, a flag é ativada de forma controlada.

Elas são amplamente utilizadas para **gerenciar lançamentos, controlar funcionalidades em produção e conduzir experimentação controlada**. Um exemplo clássico é habilitar uma nova versão da interface de um sistema apenas para uma pequena porcentagem de usuários, monitorando o feedback e comparando métricas com aqueles que ainda utilizam a versão antiga.

![Feature Flags](/assets/images/system-design/feature-flags.drawio.png)

Feature Flags **dependem de componentes centralizados para controlar a distribuição das funcionalidades**, podendo ser gerenciadas por ferramentas de mercado ou backoffices administrativos que alteram flags armazenadas em bancos de dados, entre outras soluções.

Sistemas que segmentam clientes por categorias — como Pessoa Física e Pessoa Jurídica, ou setores como Varejo, Agropecuária, Mídia, Assinaturas e Serviços — podem utilizar Feature Flags para testar funcionalidades de forma controlada entre diferentes grupos de usuários.

O uso de Feature Flags **pode ser estendido para times de negócio e produto**, permitindo que eles validem novas funcionalidades diretamente com os clientes, sem depender da intervenção dos times de engenharia.


### Clustering e Segregação de Segmentos



![Kmeans - Clustering](/assets/images/system-design/kmeans-cluster.png)



## Sharding deployment

O tema de [Sharding e Particionamento](/sharding/) já foi abordado anteriormente sob as perspectivas de dados, computação e segregação de clientes. Aqui, seguimos os mesmos princípios. Utilizando **chaves de partição** bem estruturadas e definidas, **podemos subdividir nossas infraestruturas de forma isolada e direcionar os clientes para esses shards de maneira consistente**. Isso permite **expandir as capacidades de deployment para shards menos prioritários, ambientes de teste ou pilotos, validando novas versões de forma parcial com apenas uma fração dos usuários e clientes**.

Essa abordagem é amplamente utilizada em arquiteturas **multi-tenant**, possibilitando a propagação controlada de novas versões para subconjuntos específicos de clientes, em vez de toda a base de usuários. Dessa forma, uma eventual falha não se espalha para o sistema inteiro, reduzindo o impacto e facilitando a mitigação de problemas.

No entanto, essa estratégia **é altamente avançada e exige um planejamento rigoroso de capacidade e custos**, pois tende a aumentar os gastos financeiros e operacionais, uma vez que envolve a replicação de componentes básicos da infraestrutura para isolar corretamente as cargas de trabalho.



<br>

### Obrigado aos Revisores


<br>

### Referências 

[Canary Releases](https://martinfowler.com/bliki/CanaryRelease.html)

[Pros and Cons of Canary Release and Feature Flags in Continuous Delivery](https://www.split.io/blog/canary-release-feature-flags/)

[Achieve Continuous Deployment with Feature Flags](https://www.split.io/blog/continuous-deployment-feature-flags/)

[SRE Workbook - Canarying Releases](https://sre.google/workbook/canarying-releases/)

[What is blue green deployment?](https://www.redhat.com/en/topics/devops/what-is-blue-green-deployment)

[What Is Blue/Green Deployment and Automating Blue/Green in Kubernetes](https://codefresh.io/learn/software-deployment/what-is-blue-green-deployment/)

[Advanced Traffic-shadowing Patterns for Microservices With Istio Service Mesh](https://blog.christianposta.com/microservices/advanced-traffic-shadowing-patterns-for-microservices-with-istio-service-mesh/)

[Glossary CNCF - Blue Green Deployment](https://glossary.cncf.io/pt-br/blue-green-deployment/)

[BlueGreen Deployment Strategy](https://argo-rollouts.readthedocs.io/en/stable/features/bluegreen/)

[Canary Deployment Strategy](https://argo-rollouts.readthedocs.io/en/stable/features/canary/)

[Istio Canary Deployments](https://docs.flagger.app/tutorials/istio-progressive-delivery)

[8 Different Types of Kubernetes Deployment Strategies](https://spacelift.io/blog/kubernetes-deployment-strategies)