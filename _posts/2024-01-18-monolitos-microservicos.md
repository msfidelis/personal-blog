---
layout: post
image: assets/images/system-design/logo-ms-monolito.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - Microsserviços, Monolitos e Domínios
---

Este é o quarto artigo da série sobre System Design, e estou muito satisfeito com a direção que este material está tomando. Analisando o artigo depois de finalizado, acho sinceramente que este deveria ter sido o primeiro. Até o momento, ele pode ser considerado o mais "alto nível". Neste artigo, não pretendo explorar os componentes complexos por baixo do capô" dos temas; o foco está em trabalhar com tópicos e definições conceituais. Muitos dos pontos mencionados aqui serão detalhados em artigos dedicados futuramente, abordando tópicos como escalabilidade, resiliência e protocolos de comunicação, que neste momento serão apenas citados.

Este artigo busca explorar as definições, vantagens e desafios das arquiteturas de monólitos e microsserviços, proporcionando uma compreensão básica de como projetar sistemas para demandas modernas. O objetivo é oferecer uma análise detalhada que destaque não apenas as diferenças entre monólitos e microsserviços, mas também como os sistemas distribuídos, os domínios de negócios e a Lei de Conway influenciam as decisões arquiteturais das equipes de engenharia.

Reconheço que discutir este tema de maneira totalmente científica, sem ser um filósofo de boteco, é um pouco difícil. Muitas definições, exemplos, vantagens e desvantagens vêm de experiências pessoais e do senso comum, devido à falta de uma definição formal em muitos aspectos. Portanto, peço desculpas se, em algum momento, o texto seguir um caminho de discutir "sexo dos anjos" sem querer. Meu objetivo é ser o mais conceitual e pragmático possível.


<br>

# Arquitetura Monolítica

![Monolitos](/assets/images/system-design/monolito.png)

Imagine um **robozinho de controle remoto**. Recém retirado da caixa, esse robô é um monolito. Ele é composto por várias partes com diferentes responsabilidades e mecanismos, mas todas estão unidas e interconectadas, formando a totalidade do brinquedo. Se qualquer parte desse robozinho quebrar, o **brinquedo inteiro para de funcionar**. Essa é uma analogia para um sistema monolítico.

Um monolito, em termos de arquitetura de software, refere-se a **uma aplicação onde todos os componentes e serviços podem ser acessados diretamente em uma chamada local através de métodos e componentes do próprio sistema, todos eles de alguma forma interligados**, constituindo uma unidade única e indivisível. Na prática, isso significa que **todas as funcionalidades de um sistema estão presentes na mesma base de código, no mesmo binário, na mesma aplicação e, na maioria das vezes, compartilham a mesma base de dados**.

Tradicionalmente, esta abordagem favorece a simplicidade no desenvolvimento e na implantação, pois tudo está fortemente integrado. Além disso, facilita a manutenção da consistência dos dados, que é um dos maiores desafios dos sistemas modernos.

Imagine, por exemplo, uma aplicação responsável por gerenciar o backoffice de uma agência de viagens. Essa aplicação possui funcionalidades como cadastrar clientes, vender pacotes, gerenciar reservas de hotéis, passagens aéreas, aluguel de carros e cobrança dos itens dos pacotes. Em uma abordagem monolítica, todas essas funcionalidades estariam incorporadas em uma única peça de software, formando um grande pacote único.

<br>

![Monolito](/assets/images/system-design/app-monolito.png)

> Exemplo de uma arquitetura monolitica aplicada a um produto de venda de viagens

É um equívoco comum associar a arquitetura monolítica com características negativas como "errada", "arcaica" ou "legada". A escolha por uma arquitetura monolítica em uma aplicação de negócios não define automaticamente a abordagem como moderna ou antiquada. Na verdade, o monolito é, ou idealmente deveria ser, o estágio inicial de qualquer produto, exceto em casos onde o produto é projetado para lidar com uma alta demanda desde o início. Este cenário é mais comum em grandes empresas com projetos de grande escala no mercado. Empresas como [Facebook](https://softwareengineeringdaily.com/2019/07/15/facebook-php-with-keith-adams/), [Twitter](https://blog.twitter.com/engineering/en_us/a/2013/observability-at-twitter), [Uber](https://www.uber.com/en-CA/blog/up-portable-microservices-ready-for-the-cloud/) e [Netflix](https://netflixtechblog.com/seamlessly-swapping-the-api-backend-of-the-netflix-android-app-3d4317155187) começaram como monolítos e mantiveram essa arquitetura em grande escala e sob alta demanda.

<br>

### Vantagens de uma Arquitetura Monolítica

Ao considerar uma arquitetura monolítica, percebemos benefícios como maior simplicidade na gestão de dependências e interações entre funcionalidades do sistema. Isso elimina a necessidade de protocolos e estratégias de comunicação adicionais, como *HTTP*, *gRPC*, *Webhooks* e *mensageria*. Além disso, é mais fácil construir novas funcionalidades, visto que os processos de desenvolvimento, teste e implantação são unificados — considerando, é claro, o melhor cenário possível.

Uma vantagem chave, como mencionado anteriormente, é a facilidade em manter a consistência dos dados, devido à natureza da arquitetura que centraliza todos os contextos em um único banco de dados.

A arquitetura monolítica é ideal em situações onde a complexidade de código e lógica de negócio é facilmente gerenciável e a escalabilidade não é uma preocupação imediata. Isso é particularmente encontrado em aplicações de pequeno ou médio porte, ou em equipes pequenas, onde a comunicação e gestão de múltiplos serviços diversificados seriam desafios muito custosos de energia, tempo e dinheiro.

Em situações onde as pessoas responsáveis por rodar o serviço não necessariamente conhecem os detalhes da arquitetura do software, monolitos apresentam uma solução mais simples de colocar esses sistemas em produção por serem compostos por apenas uma unidade. Por exemplo, ferramentas como [Istio](https://ieeexplore.ieee.org/document/9520758) mudaram de microserviços para um monolito por ser mais simples rodar e geranciar uma aplicação única ao invés de multiplos componentes.

No que diz respeito aos ciclos de vida dos produtos, essa abordagem também oferece vantagens na construção e evolução de MVPs (Produtos Mínimos Viáveis), novos produtos e prototipações. Isso se deve à simplicidade de iniciar e evoluir projetos de tecnologia em comparação com outras alternativas.

Investir em testes unitários, de integração e seguir padrões de projeto consolidados no mercado pode garantir uma vida útil mais longa e qualidade para um sistema monolítico. A facilidade na implementação de testes de integração possibilita testar o comportamento do sistema de ponta a ponta.


### Desvantagens de uma Arquitetura Monolítica

À medida que uma aplicação monolítica cresce, os desafios relacionados à sua escala e manutenção se tornam cada vez mais evidentes no dia a dia dos times de engenharia e produto, representando um fluxo "natural" no ciclo de vida da engenharia de software.

Com o aumento na diversidade de funcionalidades, requisições e fluxos de negócios, surgem dificuldades em escalar horizontalmente. Essa necessidade é particularmente crítica em ambientes de nuvem e de alto tráfego. Além disso, a facilidade de manutenção, inicialmente vantajosa, pode se deteriorar e se tornar um problema ao longo do ciclo de vida da arquitetura. Isso gera a necessidade de rebases constantes, revisões mais detalhadas e processos de implantação mais complexos.

Também é comum que a escala vertical de serviços monolíticos, ou seja, o aumento de recursos computacionais, aumente constantemente, tornando-se um desafio financeiro. Isso se deve à necessidade contínua de maior capacidade para atender ao crescimento da demanda, paralelamente ao consumo crescente de recursos da aplicação e suas dependências.

Arquiteturas monolíticas também apresentam desafios de tolerância a falhas. Por todos os componentes estarem juntos na mesma unidade, uma falha em uma parte do sistema pode causar indisponibilidade da unidade inteira.

<br>

# Arquitetura de Microsserviços

![Ms](/assets/images/system-design/ms.png)

Agora, em vez de um robô de controle remoto, imagine uma **grande caixa de LEGO**. Cada bloco de LEGO representa uma **parte pequena e independente** do brinquedo. Com estes blocos, é possível construir diversas estruturas, como casas, carros, aviões e até robôs, utilizando diferentes peças. Se um bloco quebrar ou se desejar modificar algo na sua construção, a substituição ou alteração dos blocos necessários é relativamente simples, sem afetar os outros blocos. Essa analogia nos ajuda a compreender de forma lúdica como funcionam os microsserviços.

Microsserviços são um estilo de arquitetura de software onde uma **aplicação é dividida em um conjunto de serviços menores**, cada um operando **de forma independente** e se comunicando **indiretamente** através de um protocolo de comunicação. Cada microserviço é **focado em uma função ou recurso de negócios específico e pode ser desenvolvido**, implantado e **escalado de forma independente**.

Essencialmente, uma arquitetura de microsserviços se baseia na ideia de fragmentar um grande bloco de funcionalidades em unidades menores e mais gerenciáveis.

Retomando o exemplo anterior do software de backoffice para uma agência de viagens, as funcionalidades como gestão de clientes, pacotes, reservas de serviços e processos de pagamento podem ser divididas em pequenos serviços autônomos. Estes serviços podem se comunicar entre si por meio de protocolos específicos, ou serem acessados diretamente pelas requisições dos clientes através de endpoints e rotas específicas.

<!-- NOTA: Não sei se ficaria muito bagunçado, mas acho que seria interessante colocar umas setas entre os serviços, mostrando que uma requisição pode precisar de vários serviços. -->
![microsserviços](/assets/images/system-design/app-ms.png)


> Exemplo de uma arquitetura de microsserviços aplicada a um produto de venda de viagens

<br>

A adoção de arquiteturas de microsserviços geralmente surge em resposta a problemas de escalabilidade e manutenção, onde a necessidade de chamadas heterogêneas começa a ser importante para lidar com a escala e a demanda. Isso é particularmente útil quando se trabalha com processamentos assíncronos, se busca diminuir o acoplamento de sistemas críticos de alto volume e reduzir pontos únicos de falha.

Imagine um cenário onde sua aplicação monolítica abriga funcionalidades com diferentes demandas de processamento. Por exemplo, uma função de cadastro de cliente que normalmente consome 200ms e utiliza poucos recursos do servidor e do banco de dados, pode ter que compartilhar recursos computacionais com funções como fechamento de caixa ou geração de relatórios, que exigem uso intensivo de CPU, Memória e I/O. Essa concorrência heterogênea e desproporcional pode comprometer a performance e a experiência dos outros recursos, resultando em tempos de resposta mais longos ou em erros inesperados. Esse caso em específico poderia gerar uma discussão saudável e válida sobre a viabilidade de quebrar essas funcionalidades em microsserviços diferentes.

A construção de microsserviços também se torna comum com o aumento significativo no número de equipes, produtos e profissionais, onde faz sentido gerenciar o ciclo de vida das aplicações de forma mais isolada e focada dentro de contextos específicos. Este tópico será explorado mais detalhadamente quando discutirmos a **Lei de Conway**.



### Vantagens de uma Arquitetura de Microsserviços

A vantagem citada com mais frequência em relação aos microsserviços é a descentralização. Isso se manifesta de diversas formas, como a capacidade de diferentes serviços serem desenvolvidos com distintas linguagens, tecnologias, frameworks, componentes e bancos de dados, cada um otimizado para atender às necessidades específicas de uma funcionalidade. Por exemplo, um microserviço que exige recursos de transações, onde a acurácia e a segurança dos dados são cruciais, pode ser projetado para usar bancos de dados que garantam propriedades [ACID](/teorema-cap/). Outro, focado em realizar buscas textuais, como uma busca de produtos em um e-commerce, pode ser desenvolvido com tecnologias adequadas para full-text search, como Elasticsearch e MongoDB.

Embora essa flexibilidade traga um aumento na complexidade de manutenção, documentação e gestão, é um benefício significativo frequentemente associado aos microsserviços.

A arquitetura de microsserviços também permite escalar horizontalmente cada serviço de forma independente, conforme a necessidade e o consumo de recursos. Isso significa que o scale in e scale out não afetam todas as dependências do sistema simultaneamente.

Idealmente, em uma arquitetura de microsserviços, o "Blast Radius" – ou "Raio de Explosão" – resultante da falha de um componente não afetaria os demais, permitindo que o sistema continue funcionando parcial ou totalmente, especialmente se houver implementações de fallback ou processamento assíncrono. Contudo, esse cenário depende fortemente da adoção de padrões de design de resiliência na comunicação entre as dependências.



### Desvantagens de uma Arquitetura de Microsserviços

Gerenciar múltiplos microsserviços é, sem dúvida, **mais complexo do que lidar com uma única aplicação monolítica**. Esta complexidade se estende a áreas como implantação, monitoramento e gerenciamento de falhas.

A facilidade de desenvolvimento e implantação pode ser vantajosa, mas também pode apresentar desafios. Quando é necessário corrigir um erro ou criar uma nova funcionalidade em um serviço específico, isolar e entregar uma nova versão desse componente pode ser mais simples. No entanto, isso depende da capacidade de versionar funcionalidades de forma inteligente, gerenciar contratos de forma eficiente para os protocolos de comunicação e outros fatores. A ausência desses elementos pode transformar essa vantagem em um grande obstáculo nos processos de implantação em ambientes corporativos.

Testar uma aplicação composta por diversos microsserviços independentes pode ser mais desafiador do que testar um sistema monolítico. Isso inclui a **necessidade de testes de integração e end-to-end mais complexos** e frequentemente atualizados, além da importância de ambientes de homologação confiáveis que simulem fielmente os ambientes de produção.

A **gestão da consistência e integridade dos dados em ambientes distribuídos é um dos aspectos mais desafiadores** desse tipo de arquitetura na minha sincera opinião. Problemas como transações distribuídas de longa duração, sincronização de dados e compensações retroativas (desfazer transações em cascata em caso de falhas) requerem soluções complexas para assegurar a confiabilidade dos dados, caches e réplicas de forma distribuída.

O monitoramento, a observabilidade e a geração de alertas também se tornam tópicos mais complexos. Com equipes trabalhando simultaneamente em diferentes domínios seguindo diferentes padrões, é essencial trabalhar em estratégias de monitoramento para gerir de forma eficaz e homogênea toda a infraestrutura, aplicação e dependências. Isso pode exigir ferramentas avançadas para tracing e rastreio de transações, agregação de logs e métricas coletadas de várias fontes. **A maturidade dessas ferramentas pode até superar a complexidade dos próprios microsserviços**.

A comunicação entre os serviços requer atenção especial. Enquanto em sistemas monolíticos a comunicação normalmente ocorre por meio de métodos e bibliotecas internas, em ambientes distribuídos **é necessário utilizar protocolos adicionais** como chamadas HTTP diretamente para os serviços, filas de mensagens e publicação de eventos em streams, exigindo componentes intermediários para a transmissão e recepção das mensagens.

Como os microsserviços frequentemente se comunicam através da rede interna, eles estão mais expostos a problemas de latência de rede e falhas de comunicação. A implementação de padrões de resiliência, como **circuit breakers, retries, fallbacks, filas de reprocessamento e dead letter queues** para análise, se torna essencial e deve ser integrada à cultura de desenvolvimento dos serviços.

<br>

# Domínios e Design

Em arquiteturas de software, especialmente em microsserviços, é crucial compreender e modelar corretamente os domínios de negócio. Um domínio de negócio é, em essência, **uma esfera de conhecimento, influência ou atividade sobre algum assunto**. A modelagem de domínio envolve a identificação das entidades-chave, suas relações e interações para cumprir as funções de negócio, sendo especialmente relevante em sistemas complexos com domínios de negócios profundos.

O Domain-Driven Design (DDD), ou Domínio Conduzido por Design, é uma abordagem de desenvolvimento de software que **prioriza o domínio de negócio e a lógica de domínio**. O DDD enfatiza a criação de um modelo de domínio rico e expressivo, incorporando regras e lógica de negócios e utilizando uma **linguagem comum entre desenvolvedores e especialistas de negócios para assegurar uma compreensão clara dos conceitos do domínio**, **definindo com precisão os limites e responsabilidades de cada parte do sistema**.

Essa abordagem também visa evitar armadilhas comuns no desenvolvimento de software, como a criação de modelos de domínio que são meras coleções de dados, sem comportamento ou lógica de negócios, conhecidos como **modelagem e entidades anêmicas**. O DDD destaca a importância de um modelo enriquecido, que incorpore regras e lógicas de negócios, e evita estruturas de software complexas e altamente acopladas, difíceis de compreender, manter e escalar. Em contrapartida, promove a modularidade e a clara definição de limites contextuais.

O DDD não é exclusivo para microsserviços, ele também pode ser aplicado em uma única base de código, simplificando a gestão da lógica de domínio e **reduzindo a complexidade operacional**. Isso envolve **definir limites de escopo entre classes e módulos dentro de uma aplicação** monolítica, criando um [monolito mais modular](https://shopify.engineering/shopify-monolith). Quando aplicado à modelagem de microsserviços, o DDD pode ser utilizado para definir claramente os **limites e responsabilidades dos microsserviços, arquitetar e diminuir a complexidade entre eles, implementando uma gestão cuidadosa de comunicação e dados**.

Em ambos os casos, o DDD alinha o design do software com o domínio de negócios, mas a arquitetura escolhida (microsserviços ou monolítica) influencia como esse alinhamento é realizado, gerenciado e colocado em produção.

![DDD Viagens](/assets/images/system-design/ddd-viagem.png)

> Exemplo de DDD aplicado à construção de uma aplicação de vendas de pacotes de viagens.

Este exemplo pode ser utilizado tanto para elaborar um diagrama de classes e módulos em uma aplicação monolítica quanto para definir as responsabilidades em microsserviços, caso cada um desses contextos limitados seja separado em uma aplicação independente.

Um dos maiores desafios no design de microsserviços é identificar corretamente os limites de serviço. Com o DDD, os serviços são organizados em torno de limites de contexto delimitado, onde cada serviço gerencia um conjunto distinto de entidades e lógicas de negócio. Isso ajuda a manter os serviços pequenos, focados e independentes.

Em ambientes de alta complexidade, com muitas equipes e serviços, a modelagem de negócios e arquitetura a nível de domínio auxilia no mapeamento dos responsáveis por cada funcionalidade, evitando a duplicação de soluções e promovendo a reutilização de componentes existentes. Em grandes corporações, é crucial evitar a criação de sistemas diferentes, desenvolvidos por equipes distintas, que executam funções similares de forma redundante.

<br>

# Lei de Conway na arquitetura de sistemas

![Lei Conway](/assets/images/system-design/lei-de-conway.png)

A Lei de Conway foi formulada por **Melvin Conway**, um programador e cientista da computação. Originalmente apresentada em um paper rejeitado por Harvard em 1967, sob a alegação de que "ele não conseguiu provar sua tese", ela ganhou notoriedade após ser publicada na revista de tecnologia "Datamation". No artigo, intitulado ["Como os Comitês se Inventam?" (tradução literal)](https://www.melconway.com/Home/Committees_Paper.html), Conway introduziu a ideia de que a **estrutura organizacional de uma empresa influencia diretamente a arquitetura do software que ela desenvolve**. Ele observou que os **designs dos sistemas refletem a estrutura de comunicação das organizações**.

Essencialmente, a Lei de Conway sugere que **a forma como uma empresa está organizada – isto é, como as equipes são formadas e como se comunicam entre si – tende a moldar o desenvolvimento do software**. Por exemplo, em organizações com muitos grupos pequenos trabalhando de forma independente, o software resultante provavelmente terá vários componentes independentes. Se a estrutura organizacional é mais integrada, o software pode seguir o mesmo padrão.

Considerando uma empresa com times separados para frontend, backend e gestão de dados, o software desenvolvido provavelmente terá módulos distintos para cada função, utilizando tecnologias específicas como SPA's, Microfrontends, Backend for Frontends, API's REST, GraphQL's, Procedures, entre outros. Em startups menores, onde a equipe é unificada e as decisões são rápidas e colaborativas, o software tende a ser mais integrado e menos modular, refletindo a agilidade e flexibilidade da equipe. Em grandes corporações com pouca comunicação interdepartamental, é comum encontrar sistemas fragmentados ou com funcionalidades redundantes.

A Lei de Conway também influencia a adoção de arquiteturas como monolitos e microsserviços quando acontecem de forma orgânica, além de outras decisões arquiteturais arbitrárias. Em organizações com estrutura mais centralizada e hierárquica, com comunicação vertical predominante, os sistemas desenvolvidos tendem a ser monolíticos, espelhando essa centralização em uma base de código unificada. Isso também ocorre em ambientes "informais" com alta comunicação e integração. Por outro lado, em organizações com equipes menores, autônomas e com comunicação interna intensa, mas menos interação intergrupal, é mais provável a emergência de sistemas baseados em microsserviços, refletindo a independência e especialização de cada equipe, com cada microserviço representando um aspecto específico do negócio.

<br>

#### Obrigado aos Revisores

* [Tarsila, o amor da minha vida](https://twitter.com/tarsilabianca_c)

* [Gabriel Xará](https://twitter.com/gmxara)

* [Pedro Amaral](https://twitter.com/predotaku)

* [Felipe Madureira](https://twitter.com/madfelps)

* [Jorge Oliveira](https://twitter.com/JorgeOliveira00)

* [Luiz Aoqui, o revisor universal da comunidade](https://twitter.com/luiz_aoqui)

> Imagens geradas pelo DALL-E e Bing

#### Referências

[AWS - Qual é a diferença entre arquitetura monolítica e de microsserviços?](https://aws.amazon.com/pt/compare/the-difference-between-monolithic-and-microservices-architecture/)

[Microsserviços x arquitetura monolítica: entenda a diferença](https://viceri.com.br/insights/microsservicos-x-arquitetura-monolitica-entenda-a-diferenca/)

[Domain Driven Design](https://en.wikipedia.org/wiki/Domain-driven_design)

[Pattern: Monolithic Architecture](https://microservices.io/patterns/monolithic.html)

[Martin Fowler: Microservices](https://martinfowler.com/articles/microservices.html)

[Martin Fowler: Anemic Domain Model](https://martinfowler.com/bliki/AnemicDomainModel.html)

[Martin Fowler: Conway's Law](https://martinfowler.com/bliki/ConwaysLaw.html)

[Livro: Domain-driven design: atacando as complexidades no coração do software (2016) ](https://www.amazon.com.br/Domain-driven-design-atacando-complexidades-software/dp/8550800651)

[Domain-Driven Design, do início ao código](https://medium.com/cwi-software/domain-driven-design-do-in%C3%ADcio-ao-c%C3%B3digo-569b23cb3d47)

[Conway's Law](https://www.melconway.com/Home/Conways_Law.html)

[How Do Committees Invent?](https://www.melconway.com/Home/Committees_Paper.html)

[Como a lei de Conway afeta o desenvolvimento de softwares?](https://www.supero.com.br/blog/como-a-lei-de-conway-afeta-o-desenvolvimento-de-softwares/)

[The enduring link between Conway's Law and microservices](https://www.techtarget.com/searchapparchitecture/tip/The-enduring-link-between-Conways-Law-and-microservices)



{% include mermaid.html %}
