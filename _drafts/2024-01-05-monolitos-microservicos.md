---
layout: post
image: assets/images/system-design/logo-ms-monolito.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - Microserviços, Monolitos e Sistemas Distribuídos
---

Esse é o quarto artigo da série de System Design, e estou muito feliz com o rumo que esse material está tomando, e analisando onde quero chegar com a estruturação desses textos, esse deveria ter sido o primeiro de todos. Ele talvez seja  o mais "alto nível" até o momento. Não tenho a intenção de explorar os componentes complexos debaixo do capô nesse primeiro momento, apenas trabalhar com tópicos e definições conceituais, pois muitos dos pontos abordados aqui terão artigos dedicados para destrinchar cada um deles a seguir, como escalabilidade, resiliência e protocolos de comunicação que nesse momento apenas serão citados. 

No mais, esse artigo busca explorar as definições, vantagens e desafios das arquiteturas de monólitos e microserviços, proporcionando uma compreensão simples de como projetar sistemas para demandas modernas. O objetivo é fornecer uma análise detalhada que não apenas destaque as diferenças entre monólitos e microserviços, mas também explore como os sistemas distribuídos, os domínios de negócios e a Lei de Conway influenciam as decisões arquitetônicas dos times de engenharia sobre esse tema. 

Eu sei que é um pouco difícil falar desse tema de maneira totalmente cientifica e sem filosofar demais a respeito, pois muitas definições, exemplos, vantagens e desvantegens vem muito de experiências pessoais granulares e senso comum de muita gente pela falta de definição formal de muitas coisas, então perdão se em algum momento eu for pra esse caminho mesmo sem perceber, mas meu objetivo vai ser tentar ser totalmente conceitual e pragmático. 

<br>

# Arquitetura Monolítica

![Monolitos](/assets/images/system-design/monolito.png)

Imagine um **robozinho de controle remoto**. Esse robô, tirado da caixa, é um monolito. Ele pode ser feito em várias partes com várias responsabilidades e mecanicas diferentes, porém todas elas estão juntas e são interligadas representando a totalidade do brinquedo, de fato que se qualquer parte desse robozinho quebrar, o **brinquedo inteiro para de funcionar**. Essa é uma alusão de um sistema monolitico. 

Um monólito em termos de arquitetura de software refere-se a **uma aplicação onde todos os componentes e serviços estão interligados e interdependentes**, formando uma unidade única e indivisível de software. Isso significa na prática em que **todas as funcionalidades de um sistema estão presentes na mesma base de código, mesmo binário, mesma aplicação e compatilham da mesma base de dados** na sua grande maioria. 

Essa abordagem, tradicionalmente, favorece a simplicidade de desenvolvimento e implantação, pois tudo está fortemente integrado, além de ser simples manter consistência de dados, que é um dos maiores desafios de sistemas modernos. 

Imagine uma aplicação que é responsável por gerenciar o backoffice de uma agência de viagens. Podemos presumir que essa aplicação tem como funcionalidades cadastrar clientes, cadastrar e vender pacotes, receber estimulos para reservar hoteis, passagens aéreas, reservas de hotel, reserva de carro se necessário e cobrar os itens do pacote. Uma abordagem monolítica seria colocar todas essas funcionalidades em uma única peça de software, em um unico grande pacote.  

<br>

![Monolito](/assets/images/system-design/app-monolito.png)
> Exemplo de uma arquitetura monolitica aplicada a um produto de venda de viagens

Erroneamente se associa ao monolito uma característica "errada", "arcaica" ou "legada". Usar ou não arquitetura monolitica em uma aplicação de negócio não caracteriza a mesma como uma abordagem moderna ou antiga. Monolito é, ou deveria ser, o estágio inicial de qualquer produto, a não ser é claro que esse produto seja projetado para nascer com uma alta demanda prevista, cenário que comumente acontece em grandes empresas com grandes cases de mercado.

<br>

### Vantagens de uma arquitetura monolitica

Quando olhamos para uma arquitetura monolitica, podemos entender que teremos mais simplicidade na gestão de dependências e interações entre funcionalidades específicas do sistema sem a necessidade de fazer uso de um protocolo e estratégias de comunicação extras como requests *HTTP*, *gRPC*, *Webhooks* e *mensageria*, além de termos maior facilidade na construção de features devido ao processo de desenvolvimento, testes e implantações serem unificados. Isso é claro, se avaliarmos o melhor cenário possível. 

Uma das principais vantagens, como já comentado, é a facilidade de manter consistência de dados pela natureza da arquitetura de manter todos os contextos dentro de um único banco de dados. 

Uma arquitetura monolitica é ideal onde a complexidade é gerenciável facilmente e a escalabilidade não é uma preocupação primária, mais especificamente para aplicações de pequeno ou médio porte ou equipes muito pequenas, onde a comunicação e gestão de multiplos serviços diversificados seria um desafio muito custoso. 

Olhando para ciclos de vida de produtos, também temos uma vantagem para construção e evolução de MVP's, novos produtos e prototipagens, pois é muito simples começar e evoluir produtos de tecnologia comparado com as outras alternativas. 

É possível investir em testes unitários, de integração e em padrões de projetos de mercado para garantir uma vida útil maior para a qualidade de um sistema monolitico. A facilidade de implementação de testes de integração permite testar o comportamento de fim a fim 

### Desvantagens de uma arquitetura monolitica

À medida que uma aplicação monolítica cresce, os desafios associados à sua escala e manutenção se tornam cada vez mais evidentes, e esse talvez seja o fluxo "natural" do ciclo de vida da engenharia de software. 

Conforme temos um crescimento na diversificação de funcionalidades, requisições e fluxos de negócio, podemos encontrar dificuldades em escalar horizontalmente, o que é uma necessidade em ambientes de cloud e de alto tráfego, além de que a facilidade de manutenção que seria uma vantagem inicialmente, pode crescer mal e se tornar um ponto negativo no ciclo de vida da arquitetura, gerando a necessidade de rebases constantes, revisões mais atenciosas e processos de implantação mais dolorosos. 

É relativamente comum a escala vertifical de serviços monoliticos serem constantes e se tornarem um problema financeiro para o produto, devido a necessidade constante de recapacity para atender ao crescimento da demanda paralelamente ao consumo de recursos centralizados da aplicação e suas dependencias. 


<br>

# Arquitetura Microserviços

![Ms](/assets/images/system-design/ms.png)

Agora ao invés de um robô de controle remoto, pense numa **grande caixa de LEGO**. Cada bloco de LEGO é uma **parte pequena e separada**. Você pode construir muitas coisas diferentes, como uma casa, um carro, ou um avião e até mesmo um robozinho usando blocos diferentes. Se um bloco quebrar ou se você quiser mudar algo no seu brinquedo, é relativamente simples, você só troca os blocos que precisa sem mexer nos outros. Podemos imaginar agora como funcionam microserviços de forma lúdica. 

Microserviços são um estilo de arquitetura de software onde uma **aplicação é dividida em um conjunto de pequenos serviços**, cada um operando **de forma independente**. Cada microserviço é **focado em uma única função ou recurso de negócios e pode ser desenvolvido**, implantado e **escalado independentemente**.

Basicamente, uma arquitetura de microservicos se baseia em pegar um gigante bloco de funcionalidades e quebrá-lo em blocos menores.

Usando o mesmo exemplo anterior de um software de backoffice para uma agência de viagens, podemos entender que as funcionalidades como gestão de clientes, pacotes, reservas de serviços e pagamentos podem ser divididos em pequenos serviços menores que podem se comunicar entre si através de algum protocolo, ou acessados diretamente pela requisição do cliente através de endpoints e rotas especificas. 

![Microserviços](/assets/images/system-design/app-ms.png)

<br>

As adoções de arquiteturas desse tipo normalmente são decorrentes de problemas de escalabilidade e manutenção, onde a necessidade de chamadas hetegêneas começa a fazer sentido para lidar com escala e demanda, ou quando precisamos trabalhar com processamentos assincronos, diminuir acoplamento de sistemas criticos, de alto volume e diminuir pontos unicos de falha. 

Imagine um cenário onde sua aplicação monolitica possui funcionalidades diferentes, que tem pesos de processamento diferentes, onde uma chamada para cadastrar um cliente que consome normalmente 200ms e pouquissimo recurso do servidor e banco de dados precisa compartilhar recursos computacionais com uma chamada de fechamento de caixa, relatórios, batches que fazem uso intensivo de CPU, Memória e I/O, essa concorrência heterogênea e desproporcional acabariam comprometendo a performance e experiência das outros recursos que demorariam mais do que o normal, ou gerariam erros inesperados. Esse caso, poderia gerar uma discussão saudável sobre a viabilidade de quebrar essas funcionalidades em um microserviço diferente. 

É comum a construção de microserviços quando temos um aumento significativo na quantidade de equipes, produtos e profissionais, onde faz sentido gerenciar o ciclo de vida das aplicações de forma mais isolada e intimista dentro de determinados contextos. Iremos abordar um pouco mais desse tópico quando entrarmos na discussão da **Lei de Conway**. 


### Vantagens de uma arquitetura de microserviços

A principal vantagem que possivelmente será citada por qualquer pessoa na hora em que lhe for perguntada a respeito de microserviços, é a descentralização. Isso pode ser entendido de algumas formas, como a possibilidade de diferentes serviços serem desenvolvidos com diferentes linguagens, tecnologias, frameworks, componentes e databases sob medida para atender da melhor forma as necessidades daquela funcionalidade. Como um microserviço que necessite de recursos de transactions, onde a acurácia e segurança do dado são mais cruciais do que qualquer outro requisito pode ser projetado para usar bancos de dados transacionais que garantam o ACID, outro que precisa realizar buscas textuais entre diversos campos como uma busca de e-commerce ser desenvolvido isoladamente utilizando tecnologias que possibilitem full-text search como o Elasticsearch e MongoDB e etc. Esse tipo de flexibilidade, por mais que venha com um peso de complexidade de manutenção, documentação e gestão, talvez seja o exemplo mais lembrado quando o assunto vem a tona. 

A facilidade de desenvolvimento e implantação pode ser como também pode não ser uma grande vantagem. Quando precisamos realizar uma correção ou criar uma nova feature numa funcionalidade específica, podemos entender que é muito mais simples entregar uma nova versão isoladamente em um componente especifico. No melhor dos mundos, de fato é, se conseguirmos realizar versionamento das funcionalidades de forma pragmática, gestão de contratos eficiente para os protocolos de comunicação que o microserviço se comunica e etc. A falta desses fatores pode tornar essa vantagem no maior terror dos processos de implantação em ambientes corporativos. 

Como podemos quebrar funcionalidades em pequenos serviços, temos a capacidade de escalar horizontalmente independentemente cada um desses serviços conforme a necessidade de uso e overhead cada um deles, de fato com que o scale in e scale out não impacte todas as dependencias do sistema de uma só vez. 

No melhor dos mundos, podemos presumir também que em uma arquitetura de microserviços o "Blast Radius", ou  "Raio de Explosão" decorrente da falha de um dos componentes que compõe o sistema não impactariam os demais, deixando o sistema funcionando de forma parcial ou total caso exista alguma implementação de fallback ou processamento assincrono. Esse cenário é altamente dependente da adoção de design patterns de resiliência na comunicação entre as dependências. 


### Desvantagens de uma arquitetura de microserviços

Gerenciar múltiplos serviços pode ser mais complexo do que lidar com uma única aplicação monolítica como já conseguimos ver claramente. Essa complexidade se estende a tarefas como implantação, monitoramento, e gerenciamento de falhas. 

Testar uma aplicação composta por muitos microserviços independentes pode ser mais difícil do que testar uma aplicação monolítica. Isso inclui a necessidade de testes de integração e end-to-end mais abrangentes e que precisam ser revisitados constantemente, e de a maturidade de ambientes de homologação semelhantes aos produtivos para execução dos mesmos com segurança e maxima fidelidade possível. 

Manter a consistência e integridade de dados em um ambientes distribuídos é pra mim um dos assuntos mais complicados na hora de falar desse tipo de arquitetura. Problemas como transações distribuídas, de longa duração, sincronização de dados e compensação retroativa (desfazer transações em cascata em caso de falha de algum componente entre vários) podem gerar discussões difíceis e muita engenharia para manter a confiabilidade dos dados, caches e replicas que diversas responsabilidades distribuídas mantém entre si. 

O monitoramento, observabilidade e alertas tendem a ser assuntos mais quentes e complexos também. Além de ter equipes trabalhando simultaneamente em diferentes domínios do seu projeto, você precisa de um monitoramento robusto para gerenciar efetivamente toda a infraestrutura, aplicação, dependência e regras de negócio. Tendem a surgir necessidades de ferramentas que permitam efetuar rastreabilidade de transações e agragação de logs e métricas de diversas fontes. Evoluir a  maturidade desse tipo de ferramental pode se tornar até mesmo mais complexo que os microserviços propriamente ditos. 

É necessária a constante atenção com as estratégias de comunicação entre os serviços. Em sistemas monolíticos essa comunicação normalmente é efetuada por meio de funções e bibliotecas disponíveis entre os modulos, em ambientes distribuídos essa comunicação requer a utilização de protocolos extras como chamadas HTTP diretamente entre si, publicação de mensagens em filas, publicação de eventos em tópicos de streams utilizando componentes intermediários para receber e entregar as mensagens aos seus interessados. 

Como os microserviços frequentemente se comunicam através da rede interna do seu ambiente, eles são mais suscetíveis a problemas relacionados a latência de rede e falhas de comunicação entre suas dependências. A necessidade de implementação de padrões de resiliência como circuit breakers, retries, construção de fallbacks, filas de reprocessamento, dead letter queues para análise tendem a ser mais necessários e precisam ser inseridos no formato cultural no ciclo do desenvolvimento dos serviços.

# Domínios e Design 

Em arquiteturas de software, especialmente em microserviços, é crucial entender e modelar corretamente os domínios de negócio. Um domínio de negócio é basicamente uma esfera de conhecimento, influência ou atividade. A modelagem de domínio envolve identificar as entidades chave, suas relações e como elas interagem para realizar as funções de negócio, e é especialmente útil em sistemas complexos, onde a profundidade do domínio de negócios é grande.

Domínio Conduzido por Design, ou Domain Driven Design (DDD) é uma abordagem para o desenvolvimento de software que coloca o foco principal no domínio de negócio e na lógica de domínio. 

O DDD enfatiza a criação de um modelo de domínio rico e expressivo que incorpora regras e lógica de negócios, fazendo uso de uma linguagem comum entre desenvolvedores e especialistas de negócios para garantir que todos entendam claramente os conceitos do domínio, **definindo claramente os limites e as responsabilidades de cada parte do sistema**.

O Domínio Conduzido por Design também busca evitar várias armadilhas comuns no desenvolvimento de software. O DDD busca **evitar criar modelos de domínio que são apenas coleções de dados sem comportamento ou lógica de negócio**, também conhecidos como **modelagem e entidades anêmicas**. Essa abordagem enfatiza a importância de um modelo rico, incorporando regras e lógicas de negócio, além de arbitrariamente evitar estruturas de software complexas e altamente acopladas, que são difíceis de entender, manter e escalar. Em vez disso, promove a modularidade e a definição clara de limites de contexto.

![DDD Viagens](/assets/images/system-design/ddd-viagem.png)

Um dos maiores desafios no design de microserviços é identificar os limites de serviço corretos. Usando DDD, os serviços são geralmente organizados em torno de limites de contexto delimitado, onde cada serviço gerencia um conjunto distinto de entidades e lógicas de negócio. Isso ajuda a manter os serviços pequenos, focados e independentes. 

E em ambientes onde o nível de complexidade total é muito grande, o número de equipes e serviços são gigantescos, uma modelagem de negócio e arquitetura a nível de domínio ajuda a mapear os responsáveis por cada funcionalidade e evitar que times criem soluções duplicadas para necessidades diferentes ao invés de reaproveitarem os blocos de lego já construídos. Em uma grande corporação, ter dois sistemas completamente diferentes, desenvolvido por times diferentes em periodos diferentes que cumpram funções parecidas como reservar uma passagem de vôo, cobrar utilizando algum método de pagamento ou fazer gestão de clientes pode ser uma falha grave de governança. 

# Lei de Cownway na arquitetura de sistemas

#### Obrigado aos Revisores

#### Referências 

[AWS - Qual é a diferença entre arquitetura monolítica e de microsserviços?](https://aws.amazon.com/pt/compare/the-difference-between-monolithic-and-microservices-architecture/)

[Microsserviços x arquitetura monolítica: entenda a diferença](https://viceri.com.br/insights/microsservicos-x-arquitetura-monolitica-entenda-a-diferenca/)

[Domain Driven Design](https://en.wikipedia.org/wiki/Domain-driven_design)

[Pattern: Monolithic Architecture](https://microservices.io/patterns/monolithic.html)

[Martin Fowler: Microservices](https://martinfowler.com/articles/microservices.html)

[Martin Fowler: Anemic Domain Model](https://martinfowler.com/bliki/AnemicDomainModel.html)

[Livro: Domain-driven design: atacando as complexidades no coração do software (2016) ](https://www.amazon.com.br/Domain-driven-design-atacando-complexidades-software/dp/8550800651)

[Domain-Driven Design, do início ao código](https://medium.com/cwi-software/domain-driven-design-do-in%C3%ADcio-ao-c%C3%B3digo-569b23cb3d47)
