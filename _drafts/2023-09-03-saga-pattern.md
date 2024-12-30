---
layout: post
image: assets/images/system-design/saga-logo.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - Saga Pattern
---

O ano de publicação desse texto **foi marcado por interessantes experiências profissionais nas quais eu pude resolver problemas muito complexos de sistemas distribuídos utilizando o modelo Saga**. Logo, por mais que tenha sido sencional poder compilar todas as referências bibliográficas e materiais que consumi por todo esse período aqui, também foi extremamente desafiador remover as "exclusividades" que foram trabalhadas e deixas as sugestões dem um excesso de particularidades dos meus cenários. 

É sempre maravilhoso poder contemplar um material finalizado sobre o tema de microserviços, arquitetura e sistemas distribuídos, mas esse capítulo em questão foi entregue com extrema felicidade. Espero que seja de bom proveito para todos que estão buscando por referências e experiências com esse tipo de implementação. 

<br>

# O que é o modelo SAGA?

Uma transação Saga **é um padrão arquitetural que visa garantir a consistência dos dados em transações distribuídas**, especialmente em cenários onde essas **transações dependem da execução contínua da mesma em múltiplos microserviços** ou **possuam uma longa duração até serem completamente finalizadas**. 

O termo Saga vem do sentido literal de Saga, que o conceito **remete a uma aventura, uma história, uma jornada do herói**, jornada na qual a mesma remonta vários capítulos onde o "herói" precisa cumprir objetivos, enfrentar desafios, superar seus limites e concluir um objetivo predestinado. Dentro de uma implementação do Saga Pattern, uma Saga **possui uma característica sequencial, na qual a transação depende de diversos microserviços para ser concluída**, com etapas que devem ser executadas uma após a outra de forma ordenada e distribuída. 

A implementação dessas etapas pode variar entre abordagens **Coreografadas e Orquestradas**, as quais serão exploradas mais adiante. Independentemente da abordagem escolhida, **o objetivo principal é gerenciar transações que envolvem dados em diferentes microserviços e bancos de dados**, ou que são de longa duração, e **garantir que todos os passos sejam executados sem perder a consistência e controle**, e em caso de falha de algum dos componentes por erros sistemicos ou por entradas de dados inválidas ter a capacidade de notificar **todos os participantes da saga a compensarem a transação executando um rollback de todos os passos já executados**. 

Lembrando que a principal proposta do modelo Saga é garantir confiabilidade e consistência, não parformance. Inclusive, suas maiores nuâncias pagam o preço de performance para atingir esses objetivos. 

## A Origem Histórica do Saga Pattern

Não é costume desta série de textos aprofundar demasiadamente os detalhes acadêmicos e históricos dos tópicos abordados. Porém, vale destacar **as origens do Saga Pattern** e o problema que ele foi originalmente concebido para resolver.

![Artigo Saga](/assets/images/system-design/saga-artigo.png)

O **Saga Pattern** foi publicado pela primeira vez por **Hector Garcia-Molina** e **Kenneth Salem**, em **1987**, em um artigo para o **Departamento de Ciências da Computação da Universidade de Princeton**, intitulado **"[SAGAS](https://www.cs.cornell.edu/andru/cs711/2002fa/reading/sagas.pdf)"**. O objetivo do artigo era enfrentar a **problemática das Long Live Transactions (LLTs)** nos computadores da época, quando já se buscava uma forma de lidar com processos que **demandavam mais tempo que as operações tradicionais** e não podiam simplesmente **bloquear os recursos computacionais** até sua conclusão.

Como mencionado, o termo “Saga” faz alusão a **histórias que se desenrolam em capítulos menores**, ou seja, a proposta era **quebrar** uma **Transação de Longa Duração** em **várias transações menores**, cada uma podendo ser **confirmada** ou **desfeita** de forma independente. Isso transformava uma operação atômica extensa em **pequenas transações atômicas**, com um nível de supervisão pragmática.

Portanto, embora o **Modelo Saga** não tenha sido inicialmente projetado para gerenciar **consistência em microserviços**, e sim para tratar **processos computacionais em bancos de dados**, ele foi **revisitado** ao longo do tempo. À medida que **microserviços** e **sistemas distribuídos** se tornaram mais comuns no ambiente corporativo, os princípios do Saga Pattern **provarem-se úteis** para lidar com falhas e garantir a consistência nessas arquiteturas modernas.

<br>

# O problema de lidar com transações distribuídas

Uma transação distribuida é aquela que precisa acontecer em multiplos sistemas e bancos de dados simultaneamente para ser concluída. Por definição entendemos que ela precisa de multiplos participantes escrevendo e commitando seus dados para que ela seja bem sucedida, e reportando o status de escrita para quem está coordenando esse tipo de transação. 

Vamos imaginar o sistema de pedidos de um grande e-commerce. A funcionalidade principal desse sistema é receber uma solicitação de pedido e executar todas as ações necessárias para garantir a efetivação completa desse pedido, desde a solicitação até a entrega. Para isso, é preciso interagir com diversos microserviços pertinentes a esse fluxo hipotético, como **Serviço de Pedidos**,  **Serviço de Pagamentos**, **Serviço de Estoque**, **Serviço de Entregas** e um **Serviço de Notificações** que notifica o cliente de todas as etapas do pedido. 

![Saga Problema](/assets/images/system-design/saga-problema-distribuido-1.drawio.png)
> Exemplo de um processo distribuido inicial

Em uma arquitetura complexa com múltiplos serviços interligados, **cada domínio isolado precisa garantir uma parte da sequência da execução para que o pedido seja concluído com sucesso**. À medida que o **número de componentes aumenta, a complexidade também cresce**, **aumentando a probabilidade de falhas e inconsistências**.

![Saga Error](/assets/images/system-design/saga-distribuido-error.drawio.png)
> Exemplo de um erro em uma transação distribuída

Imagine que, durante a execução dessas etapas, **um dos serviços falhe por algum motivo não sistêmico em termos de resiliência**, como a **falta de um item no estoque** ou a **recepção de informações inválidas** pelo serviço de estoque. Nessas situações, **pode ser impossível continuar as chamadas para os serviços subsequentes**, como o serviço de entregas, mesmo que etapas críticas, como o processamento do pagamento, já tenham sido concluídas com sucesso. Nesse caso, **conhecer e desfazer os passos anteriores pode se tornar um problema complicado**. 

Esse cenário representa um grave problema de consistência distribuída. Sem mecanismos adequados, o sistema pode acabar em um estado inconsistente, onde o pagamento foi efetuado, mas o pedido não foi concluído. O **Saga Pattern** é uma solução que tenta solucionar exatamente esse tipo de problema, garantindo que, mesmo em caso de falhas, o sistema mantenha a integridade dos dados e retorne a um estado consistente em todos os serviços que compõe a transação.

<br>

# O problema de lidar com transações longas

Em diversos cenários, **processos complexos exigem um período um pouco mais longo para serem concluídos** em sua totalidade. Por exemplo, uma solicitação dentro de um sistema que precisa passar por várias etapas de execução **pode levar desde milissegundos até semanas ou meses para ser finalizada completamente**.

O tempo de espera entre a execução de um microserviço e o serviço subsequente **pode variar intencionalmente** devido a fatores como **agendamentos, estímulos externos, agrupamento de registros dentro de períodos** e outros. Os exemplos disso incluem **controle de cobrança de parcelamento**, **agendamento financeiro**, **consolidação de franquias de uso de produtos digitais**, **agrupamento de solicitações para processamento em batch**, **fechamento de faturas** e **controle de uso** de recursos de um sistema por seus clientes.

**Gerenciar o ciclo de vida dessas transações de longo prazo representa um desafio arquitetural significativo**, especialmente em termos de consistência e conclusão. É necessário **criar mecanismos que permitam controlar transações de ponta a ponta em cenários complexos, monitorar todas as etapas pelas quais a transação passou e determinar e gerenciar o estado atual da transação de forma transparente**. O **Saga Pattern** resolve esses problemas ao decompor transações longas em uma série de transações menores e independentes, cada uma gerenciada por um microserviço específico. Isso facilita a garantia de consistência, a recuperação de falhas no quesito de resiliência operacional.

<br>

# A Proposta de Transações Saga

Concluindo o que foi abordado anteriormente na explicação da problemática, o Saga Pattern é um padrão arquitetural projetado para **lidar com transações distribuídas e dependentes da consistência eventual de em multiplos microserviços**. 

A proposta da aplicabilidade do Saga Pattern é **decompor uma transação longa e complexa em uma sequência de transações menores e coordenadas**, que são **gerenciadas de algumas maneiras para garantir a consistência e sucesso ou erro da execução**, e principalmente garantir a **consistência dos dados em diferentes serviços que sigam o modelo "One Database Per Service"**. 

Cada Saga **corresponde a uma transação pseudo-atômica dentro do sistema, onde cada solicitação corresponde a execução de uma saga isolada**. Essas sagas em questão se consistem em um **agrupamento de operacões menores que acontecem localmente em cada microserviço da saga**. Além de proporcionar meios de garantir que todas as etapas sejam concluídas, **caso uma das operações da saga falhe, o Saga Pattern define transações compensatórias** para desfazer as operações já executadas, assegurando que o sistema se mantenha consistênte até mesmo durante uma falha. 

A proposta da Saga [quando aplicado em abordagens assincronas](/mensageria-eventos-streaming/) elimina a necessidade de bloqueios síncronos e prolongados, como o caso do **Two-Phase Commit (2PC)** que são computacionalmente caros e podem se tornar gargalos de desempenho em ambientes distribuídos. 

Existem dois modelos principais para implementar o Saga Pattern, o **Modelo Orquestrado** e o **Modelo Coreografado**. Cada um deles possui características de coordenação e comunicação das transações Saga diferentes em termos arquiteturais. A escolha entre os modelos depende das necessidades específicas de como o sistema foi projetado, e principalmente deve levar em conta a complexidade das transações.

<br>

## Modelo Orquestrado

No **Modelo Orquestrado**, propõe a existência de um **componente centralizado de orquestração** que gerencia a execução das sagas. O Orquestrador é responsável por **iniciar a saga, coordenar a sequência de transações, monitorar as respostas e gerenciar o fluxo de compensação em caso de falhas**. Ele atua como um **control plane** que envia comandos para os microserviços participantes e espera pelas respostas para **decidir os próximos passos ou resumir a saga**.

![Orquestrador](/assets/images/system-design/saga-orquestrado-circulo.png)
> Exemplificação do Modelo Orquestrado

Considere que para concluir uma transação de um pedido de compra, você precisa estimular e esperar a resposta de confirmação de uma série de domínios como **pagamentos**, **estoques**, **notificações** e **entregas**. **São muitos componentes distribuidos, com suas próprias limitações, capacidades de escala, modos de uso, que possuem seus próprios contratos e precisam ser acionados de forma sequencial e lógica para que a transação seja concluída.** Assumindo uma abordagem assincrona, um orquestrador utiliza-se do pattern de [command / response](/) para acionar esses microserviços, e mediante a resposta de cada um deles **acionar o próximo da saga ou concluir e encerrá-la** se for conveniente. Um orquestrador também pode trabalhar de forma sincrona se necessário sem nenhuma restrição, porém mecanismos de resiliência que já são "nativos" de mensageria, como backoff, retries e DLQ's devem ser implementados manualmente para garantir uma resiliência saudável da execução da saga.

Então **a função do orquestrador é basicamente montar um "mapa da saga"**, com **todas as etapas que precisam ser concluídas para a finalização da mesma**, enviar **mensagens e eventos para os respectivos microserviços** e a partir de suas respostas, **resumir e estimular o próximo passo da Saga até que a mesma esteja totalmente completa**. 

O modelo orquestrado é dependente de a **implementação de um pattern de Maquina de Estado**, e o mesmo **deve ser capaz de gerenciar o estado atual, mediante a uma resposta mudar esse estado e tomar uma ação mediante ao novo estado**. Dessa forma conseguimos controlar a orquestação de forma centralizada e segura, onde a partir de uma aplicação central, podemos metrificar todos os passos, inicio e fim da execução da saga, controle de historico e alteração de estado de forma transacional e etc. 

### Modelo de Comando / Resposta em Transações Saga

Em implementações modernas de Saga Pattern, principalmente no modelo orquestrado, muitas das interações entre os participantes da Saga ocorrem de forma assincrona e reativa. Nessa abordagem, o **orquestrador da saga** (ou um serviço solicitante, fora do saga pattern) envia um **comando** para outro microserviço realizar uma ação, e **aguarda** a resposta de forma **bloqueante** ou **semi-bloqueante** antes de prosseguir para o próximo passo da Saga. 

![Comando e Resposta](/assets/images/system-design/saga-command-response.drawio.png)
> Modelo de Comando e Resposta de Fluxos Assincronos

Isso presume que os serviços expostos precisam expor um tópico de ação, e outro para resposta daquela ação em questão, para que o orquestrador ou serviço solicitante saiba onde enviar o comando e onde aguardar pela exposta de conclusão com sucesso ou falha do mesmo. 

<br>

## Modelo Coreografado

O modelo Coreografado, ao contrário do Orquestrado que **propõe um componente centralizado que conhece todos os passos da saga, propõe que os microserviços devem conhecer o serviço seguinte e o anterior**. Isso significa que **a saga é executada em uma abordagem de malha de serviço, onde num caso complexo, um microserviço quando é chamado e termina seu processo**, conhece o microserviço seguinte e o protocolo que o mesmo expõe suas funcionalidades, e o mesmo se encarrega de executar o passo e assim sucessivamente até a finalização da saga. 

![Saga Coreografado](/assets/images/system-design/saga-coreografado.drawio.png)

A mesma lógica é aplicada para seu modelo de compensação e rollback, onde o serviço que falhou é obrigado a notificar o anterior ou acione um "botão do pânico" em que toda a malha anterior regrida com os passos já confirmados. 

![Saga Coreografado - Compensacao](/assets/images/system-design/saga-coreografado-compensacao.drawio.png)

O modelo coreografado, por mais que seja mais simples e com menos garantias que o orquestrado de primeiro momento, também funciona como um viabilizador de fluxos sincronos para arquiteturas sagas. 

<br>

# Adoções Arquiteturais

As abordagens Saga podem variar e se extender para diversos patterns arquiteturais. Nessa sessão vamos abordar alguns dos padrões e abordagens que eu considerei mais importantes e relevantes para serem considerados quando avaliamos uma arquitetura Saga para algum projeto. 

## Maquinas de Estado no Modelo Saga

Em arquiteturas distribuídas, **manter o estado de todos os passos que uma saga deve efetuar até ser considerada concluída é talvez a preocupação de maior criticidade**. Esse tipo de controle nos permite **identificar quais sagas ainda estão pendentes ou falharam e em que passo isso aconteceu**, permitindo criar mecanismos de monitoramento, retentativas, resumos de saga e compensação em caso de erros e etc.

### Transições de Estados da Saga

Uma Maquina de Estado, ou State Machine, tem a função de lidar com o **estados**, **eventos**, **transições** e **ações**. 

Os **Estados representam o estado atual da maquina**. Esse estado corresponde descritivamente ao status da transação, literalmente como `Iniciado`, `Agendado`, `Pagamento Concluido`, `Entrega Programada`, `Finalizado` e etc. **Os Eventos correspondem a notificações relevantes do processo que podem ou não alterar o estado da maquina**. Por exemplo, algum dos passos pode enviar os eventos `Pagamento Aprovado` ou `Item não disponível no estoque`, que são eventos que podem alterar o curso planejado da saga. **Esses eventos podem ou não gerar uma Transição**. **As Transições correspondem a mudança de um estado válido para outro estado válido decorrente de um evento recebido.** Por exemplo, se o estado de um registro for `Estoque Reservado` e o sistema de pagamentos enviar o evento de `Pagamento Concluído`, isso pode notificar a maquina e transicionar o estado para `Agendar Entrega`, caso o evento emitido for `Pagamento Recusado`, o estado da maquina pode ser transicionado para `Pedido Cancelado` por exemplo. 

![Transicoes](/assets/images/system-design/saga-transicoes.png)

E dentro de um modelo saga, entendemos que o **estado corresponde a saga em si** e **eventos são as entradas e saídas dos microserviços e passos que são chamados**. Uma maquina de estado precisa ser capaz de guardar o estado atual, e mediante a um evento de mudança que ela recebe de alguma forma, determinar se existirá uma nova transição de estado, e se sim, qual ação ele deve tomar com relação a isso. 

### Ciclo de Vida da Saga


Imagine que a saga seja iniciada, criando um **novo registro na máquina de estado que representa o início de uma saga de fechamento de pedido**. Esse estado inicial poderia ser considerado `NOVO`. Dentro do mapeamento da saga, entendemos que, quando o estado é `NOVO`, **é necessário garantir que o domínio de pedidos tenha gravado todos os dados referentes à solicitação** para fins analíticos.

![Transicoes](/assets/images/system-design/saga-transicao.png)

> Exemplo do Fluxo de Transição e Ações da Saga

Assim que o serviço de pedidos confirmar a gravação do registro, o estado pode transicionar para `RESERVANDO`, onde o **próximo passo da saga se encarregará de reservar o item em estoque**. Após receber a confirmação dessa reserva, o estado se tornará `RESERVADO`, iniciando em seguida o processo de cobrança, alterando o estado para `COBRANDO`. Nesse momento, o sistema de pagamentos será notificado e poderá levar algum tempo para responder, informando se o pagamento foi efetivado ou não.

Em caso de sucesso, o estado mudará para `COBRADO`, e o sistema de entregas será notificado sobre quais itens devem ser entregues, bem como o endereço de destino. Assim, o estado transiciona para `INICIAR_ENTREGA`. A partir daí, poderíamos ter diversos estados intermediários, nos quais ações adicionais, como o envio de notificações por e-mail, seriam realizadas. Exemplos incluem `SEPARACAO`, `SEPARADO`, `DESPACHADO`, `EM_ROTA` e `ENTREGUE`. Finalmente, a saga atinge o estado `FINALIZADO`, sendo considerada concluída em sua totalidade.

Por outro lado, se o sistema de pagamentos, partindo do estado `COBRANDO`, mudar para um estado de falha como `PAGAMENTO_NEGADO` ou `NAO_PAGO`, a saga **deverá notificar o sistema de reservas para liberar os itens, possibilitando que sejam novamente disponibilizados para compra, além de atualizar o estado analítico do sistema de pedidos**.

De modo geral, a máquina de estado segue uma lógica semelhante a:

* **Qual evento acabei de receber?** → `COBRADO COM SUCESSO`
* **Qual é o meu estado atual?** → `COBRANDO`
* **Se meu estado é `COBRANDO` e eu recebo `COBRADO COM SUCESSO`, para qual estado devo ir?** → `INICIAR_ENTREGA`
* **Qual ação devo tomar ao entrar no estado `INICIAR_ENTREGA`?** → Notificar o sistema de entregas.

Basicamente, o controle funciona questionando: **"Que evento é esse?"**, **"Onde estou agora?"**, **"Para onde vou agora?"** e, finalmente, **"O que devo fazer aqui?"**.

<br>

## Logs de Saga e Rastreabilidade da Transação

**Manter registros de todos os passos da transação pode ser extremamente vantajoso,** tanto em sagas mais simples quanto, principalmente, nas mais complexas, **porém pode se tornar custoso se mantido por longo prazo**. A principal vantagem de **manter uma coordenação de estados é possibilitar a rastreabilidade de todas as sagas**: as concluídas, as que estão em andamento ou as que foram finalizadas com erro.

Podemos considerar **estruturas e modelagens de dados que permitam gerar uma rastreabilidade completa de todos os passos iniciados e finalizados**. Dessa forma, o componente centralizado — no caso dos modelos orquestrados — registra e mantém documentados os passos executados, bem como as respectivas respostas, facilitando o controle pragmático ou manual.

![Saga Log](/assets/images/system-design/saga-log.drawio.png)

Com isso, é possível **verificar de maneira simples quais sagas apresentaram erros, mantendo esses registros na camada de dados**. Esses recursos fornecem insumos para **criar mecanismos de resiliência inteligentes** o suficiente para monitorar, retomar, reiniciar ou tentar novamente os passos que falharam, além de auxiliar na construção de uma visão analítica da execução da jornada de serviço.

![Saga Log - Error](/assets/images/system-design/saga-log-error-2.drawio.png)

<br>

## Modelos de Ação e Compensação no Saga Pattern

Projetar sistemas distribuídos é **assumir um compromisso no qual reconhecemos** que lutaremos constantemente contra problemas de consistência de dados. Os patterns de compensação dentro das transações Saga **garantem que todos os passos, executados de forma sequencial, possam ser revertidos em caso de falha**.

Assim como o **modelo Saga é criado para garantir que todas as transações saudáveis sejam executadas com sucesso**, o modelo de compensação assegura que, em caso de falha sistêmica — seja por dados inválidos, problemas de disponibilidade irrecuperáveis dentro do SLA da Saga, problemas de saldo, pagamentos, limites de crédito, disponibilidade de estoque ou dados de entrada inválidos — as ações sejam completamente revertidas, permitindo que o sistema retorne a um estado consistente e evitando que apenas parte da transação seja confirmada enquanto o restante falha.

![Funcionalidades](/assets/images/system-design/saga-funcionalidade.drawio.png)

Uma forma eficiente de projetar handlers que recebem estímulos e executam algum passo da saga, seja por meio de [endpoints de API]() ou de [listeners de eventos ou mensagens](), é **expor esses handlers junto aos métodos de reversão**. Assim, sempre haverá um handler que execute a ação e outro que desfaça essas ações. Por exemplo, `reservaPassagens()` e `liberaPassagens()`, `cobrarPedido()` e `estornarCobranca()`, ou `incrementarUso()` e `decrementarUso()`.

![Ação](/assets/images/system-design/saga-acao.drawio.png)

Uma vez que dispomos das ferramentas necessárias para que o modelo de orquestração escolhido possa acionar os microserviços responsáveis pelas ações solicitadas, podemos assegurar o chamado "caminho feliz" da saga.

![Compensação](/assets/images/system-design/saga-compensacao.drawio.png)

Com o modelo de Ação e Compensação implementado, o orquestrador da saga também pode “apertar o botão do pânico” quando necessário, notificando todos os microserviços participantes para desfazerem as ações que foram confirmadas. Em uma arquitetura orientada a eventos ou mensageria que ofereça suporte a esse tipo de transação, podemos criar um tópico de compensação da saga com múltiplos *consumer groups*, de modo que cada um receba a mesma mensagem e execute a compensação se a transação já tiver sido confirmada no serviço em questão.

<br>

## Problemas de Dual Write em Transações Saga

O **Dual Write** é conhecido tanto como um problema quanto como um pattern clássico em arquiteturas distribuídas. Ele ocorre com frequência em cenários onde determinadas operações precisam gravar dados em **dois locais diferentes** — seja em um banco de dados e em um cache, em um banco de dados e em uma API externa, em duas APIs distintas ou em um banco de dados e em uma fila ou tópico. Em essência, sempre que for necessário garantir a escrita de forma atômica em múltiplos pontos, estaremos diante desse tipo de desafio.

Para ilustrar o problema na prática em uma aplicação que utiliza o **Saga Pattern**, consideremos um exemplo em que **seja preciso confirmar a operação em um local, mas o outro esteja indisponível**. Nesse caso, a confirmação não será atômica, pois as duas escritas deveriam ser consideradas juntas para manter a consistência dos dados.

![Dual Write](/assets/images/system-design/saga-dual-write-ok.drawio.png)
> **Modelo Coreografado** - Exemplo de dual write

No **modelo coreografado**, para que uma operação seja concluída em sua totalidade, cada microserviço executa localmente as ações em seu banco de dados e em seguida **publica um evento** no broker para o próximo serviço dar continuidade ao fluxo. Esse seria o “caminho feliz” da saga, sem problemas de consistência até aqui.

![Dual Write - Error](/assets/images/system-design/saga-dual-write-error.drawio.png)
> **Modelo Coreografado** - Exemplo de falha de dual write

Os problemas de consistência aparecem, por exemplo, quando o dado não é salvo no banco de dados, mas **o evento é emitido** em sequência; ou quando o dado é salvo corretamente, porém, por indisponibilidade do broker de mensagens, **o evento não é emitido**. Em ambos os casos, o sistema pode se encontrar em um estado inconsistente.

![Dual Write - Orquestrado Dual Write](/assets/images/system-design/saga-dual-write-orquestrado.drawio-foi.png)
> **Modelo Orquestrado** - Exemplo de falha de dual write

No **modelo orquestrado**, o mesmo problema pode ocorrer, ainda que de forma ligeiramente diferente. Em um cenário de **comando e resposta** entre orquestrador e microserviços, se um deles falha ao tentar garantir a escrita dupla (entre suas dependências e o canal de resposta), poderemos ter uma **saga perdida**, em que etapas intermediárias não são confirmadas e ficam “presas” no meio do processo por falta de resposta ou confirmação.

**Garantir que todos os passos sejam executados com a devida atomicidade** é, talvez, a **maior complexidade na implementação de um modelo Saga**. Os mecanismos de controle precisam **dispor de recursos sistêmicos suficientes para lidar com problemas de falhas**, adotando retentativas, processos de supervisão de sagas e formas de identificar aquelas que foram iniciadas há muito tempo e ainda não foram concluídas ou estão em um estado inconsistente. A alternativa mais eficiente dentro de databases ACID por exemplo, é executar a publicação do evento dentro de uma [transaction](/teorema-cap/) no banco de dados, e só commitar a modificação dos dados quando os processos de comunicação estarem concluídos, garantindo todos os processos, ou nenhum é efetuado. 

### Outbox Pattern e Change Data Capture em Transações Saga 

O [Outbox Pattern](/cqrs) já foi mencionado anteriormente algumas vezes, porém resolvendo problemas diferentes. Nesse caso, podemos utilizá-lo para **atribuir uma característica transacional a execução e controle de steps da saga**. Onde temos um **processo de relay adicional em um modelo orquestrado que através de uma fila sincrona do banco,** consegue verificar quais steps de quais sagas estão pendentes e **somente removê-los dessa "fila" no banco quando todos os processos de execução do step forem devidamente executados**. 

Essa é uma abordagem interessante para se blindar contra os problemas de Dual Write e ajudar a aplicação a se garantir em questão de resiliência em períodos de indisponibilidades totais e parciais de suas dependências. 

![Change Data Capture](/assets/images/system-design/saga-outbox.drawio.png)

Mecanismos de **[Change Data Capture](/replicacao/) podem ser empregados para lidar com o transporte do dado para o sistema subsequente.** Essa abordagem pode ser implementada em ambas alternativas arquiteturais do Saga Pattern, **embora lidar com as transações de forma pragmática, controlando manualmente a execução, os fallbacks e as lógicas de negócio referentes aos steps da saga seja o mais indicado no padrão orquestrado** pelo próprio objetivo do orquestrador. 


### Two-Phase Commit em Transações Saga

Embora os exemplos deste capítulo tenham adotado uma **característica de orquestração assíncrona** para detalhar as implementações de Saga, é possível explorar tópicos que nos ajudem a **manter certos níveis de consistência** em um contexto **síncrono**, típico de uma abordagem cliente/servidor (request/reply).

O **Two-Phase Commit (2PC)** é um padrão bastante conhecido para tratar **sistemas distribuídos**. Ele propõe que, em uma transação com vários participantes, exista um **coordenador** capaz de garantir que todos estejam “pré-confirmados” (prontos para gravar a transação) antes de **efetivamente** aplicar as mudanças em seus respectivos estados, realizando, portanto, a confirmação em **duas fases**. Caso algum dos passos não confirme que esté pronto para consistir o estado, nenhum deles recebe o comando de **commit**. Além de implementações de microserviços, esse pattern é muito bem empregado em **[estratégias de replicação](/replicacao/)**.

![Saga - 2PC](/assets/images/system-design/saga-2pc.png)
> Two-Phase Commit executado com sucesso

Esse protocolo **2PC** traz a sensação de **atomicidade** para serviços distribuídos que compõem uma transação, pois o coordenador envia solicitações de confirmação a cada participante antes de efetivar o commit. Tal abordagem pode ser de grande valor em **transações Saga** que exijam a validação de todos os passos antes da conclusão total — principalmente em cenários síncronos, nos quais o cliente aguarda uma **resposta imediata** e, muitas vezes, a operação pode ser abortada repentinamente, sem a possibilidade de compensar etapas já executadas.

![Saga - 2PC ERRO](/assets/images/system-design/saga-2pc-erro.png)
> Two-Phase Commit executado com erro

Caso algum dos serviços não responsa com sucesso, ou em tempo hábil para o mecanismo de coordenação da transação, o mesmo **envia sinal de rollback da transação para que todos os participantes não considerem as transações pendentes**. 

Esse pattern, por mais que seja muito útil, também **pode se tornar um gargalo de performance em ambientes de alta demanda, por precisar gerenciar multiplas conexões abertas** a todo momento em diferentes contextos. Uma forma de otimizar esse tipo de abordagem é adotar protocolos de comunicação que **[facilite a gestão de long-live-connections como o gRPC](/padroes-de-comunicacao-sincronos/)** que pode manter conexões bidirecionais e reaproveitar a conexão para diversas requisições.


## Mecanismos de Resumo de Saga

Ainda que os mecanismos de coordenação do **Saga Pattern** forneçam diversos **“guard rails”** para a execução de transações, **imprevistos sistêmicos** podem ocorrer, resultando em inconsistências de estado entre os microserviços. Nesse cenário, é preciso tomar **decisões de negócio** sobre como lidar com falhas significativas entre os participantes da saga: optar por **compensações em massa** ou por alguma **estratégia de resumo de saga**.

No caso de um **resumo de saga**, é essencial que todos os microserviços implementem **controles de idempotência**, de forma a receber o mesmo comando múltiplas vezes sem gerar erros inesperados. Por exemplo, se um serviço de **reserva de quartos de hotel** receber repetidamente a mesma solicitação de reserva para o mesmo quarto e para o mesmo usuário, deve **aceitar** a operação sem sobrescrever ou alterar o estado, enviando a devida resposta de sucesso. Isso **facilita processos de ressincronização** do estado.

Quando o processo de coordenação (seja orquestrado ou coreografado) recebe estímulos para iniciar uma nova saga com **identificadores únicos** ou **chaves de idempotência** já existentes para outra saga já existente e iniciada, ele pode **reiniciar** a saga por completo ou **verificar** quais etapas ficaram incompletas, de modo a **resumi-las a partir do ponto em que não houve resposta**, garantindo assim a consistência das transações.





### Referências 

[SAGAS - Department of Computer Science Princeton University](https://www.cs.cornell.edu/andru/cs711/2002fa/reading/sagas.pdf)

[Saga distributed transactions pattern](https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/saga/saga)

[Pattern: SAGA](https://microservices.io/patterns/data/saga.html)

[The Saga Pattern in a Reactive Microservices Environmen](https://www.scitepress.org/Papers/2019/79187/79187.pdf)

[Enhancing Saga Pattern for Distributed Transactions within a Microservices Architecture](https://www.mdpi.com/2076-3417/12/12/6242)

[Model: 8 types of sagas](https://tjenwellens.eu/everblog/ec936db8-ba4c-430b-aeb4-15d9c50c0f8c/)

[Saga Pattern in Microservices](https://www.baeldung.com/cs/saga-pattern-microservices)

[SAGA Pattern para microservices](https://dev.to/thiagosilva95/saga-pattern-para-microservices-2pb6)

[Saga Pattern — Um resumo com Caso de Uso (Pt-Br)](https://luanmds.medium.com/saga-pattern-um-resumo-com-caso-de-uso-pt-br-d534cec67625)

[Try-Confirm-Cancel (TCC) Protocol](https://blog.sofwancoder.com/try-confirm-cancel-tcc-protocol)

[Microservices Patterns: The Saga Pattern](https://medium.com/cloud-native-daily/microservices-patterns-part-04-saga-pattern-a7f85d8d4aa3)

[Compensating Actions, Part of a Complete Breakfast with Sagas](https://temporal.io/blog/compensating-actions-part-of-a-complete-breakfast-with-sagas)

[Microserviços e o problema do Dual Write](https://arthurgregorio.eti.br/posts/dual-write-microservicos/)

[Solving the Dual-Write Problem: Effective Strategies for Atomic Updates Across Systems](https://www.confluent.io/blog/dual-write-problem/)

[Outbox Pattern(Saga): Transações distribuídas com microservices](https://medium.com/tonaserasa/outbox-pattern-saga-transa%C3%A7%C3%B5es-distribu%C3%ADdas-com-microservices-c9c294b7a045)

[Saga Orchestration for Microservices Using the Outbox Pattern](https://www.infoq.com/articles/saga-orchestration-outbox/)

[Martin Kleppmann - Distributed Systems 7.1: Two-phase commit](https://www.youtube.com/watch?v=-_rdWB9hN1c)

[Distributed Transactions & Two-phase Commit](https://medium.com/geekculture/distributed-transactions-two-phase-commit-c82752d69324)

[Try-Confirm-Cancel (TCC) Protocol](https://blog.sofwancoder.com/try-confirm-cancel-tcc-protocol)