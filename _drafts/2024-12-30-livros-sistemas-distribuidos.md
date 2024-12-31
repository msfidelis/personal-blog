---
layout: post
image: assets/images/recomendacao-sistemas-distribuidos.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: Guia de Literatura de Sistemas Distribuídos (e o porquê eu não quero que você o siga)
---

Esse não é um artigo comum aqui do blog. Na verdade, é o tipo de material que eu sou mais relutante em produzir: uma recomendação. Não gosto de dar recomendações gerais porque isso presume muita coisa sobre muitas pessoas ao mesmo tempo, ignorando peculiaridades, nuances e momentos distintos de cada um que pode ler e interpretar algo de formas diferentes. Na verdade, esse receio molda a maneira como prefiro acompanhar a carreira das pessoas no dia a dia e conduzir mentorias: de forma pontual, direta e olhando para a pessoa que está à minha frente, sem presumir nenhum molde genérico do tipo “faça assim que vai dar certo pra você”. A coisa menos genérica que existe é gente... Gosto de olhar cada pessoa individualmente, caso a caso. Por isso, já desisti várias vezes de escrever um post assim, mas aqui está...

<br>

# Porquê você não deveria seguir esse roteiro

Recentemente, fiz um exercício típico de fim de ano — com a mente vazia —, imaginando uma mentoria comigo mesmo há 6 ou 7 anos do jeito que eu mais gosto. Uma mesa de boteco sem crachás. Olhei para minha prateleira de livros, para o meu histórico no Kindle e montei um roteiro de Matheus para Fidelis.

E esse é o motivo pelo qual eu não quero que você siga esse roteiro ao pé da letra. Porém, fique à vontade para, daqui em diante, usar como recomendação o que lhe agradar aos olhos e adaptar à sua realidade, já que não terei a oportunidade de ajudá-lo(a) tão de perto.

> Muito importante ressaltar: Todos os links que direcionam para a Amazon são de afiliado. Mas você pode buscar o recurso onde achar melhor. 

Autocrítica é muito legal. Não faço questão de ser um cristal perfeito em pessoa — mesmo sendo movido por um desejo constante de autoaperfeiçoamento —, acho que isso só é possível porque assumo que tenho muito a melhorar o tempo todo. Tenho muitas dificuldades, até mesmo em áreas nas quais me considero bom. Uma delas é justamente não saber ensinar conteúdo introdutório. Reconheço que é uma falha minha; muita gente faz isso extraordinariamente bem, e admiro essas pessoas por esse e outros motivos. É a minha kryptonita. Por isso, vou partir do pressuposto de que você não seja um iniciante.

Presumo, então, que você já tenha uma boa quilometragem em empresas e projetos de software. Que já tenha feito **algumas** coisas que deram certo, e **muitas que deram errado**.

Em termos de conteúdo técnico, parto do princípio de que você já esteja familiarizado(a) com:

* Containers e Orquestração, mesmo que básica
* Vivência em alguma cloud, qualquer que seja
* Alguma linguagem de programação (em nível pleno ou sênior+)
* A “literatura feijão com arroz” (Clean Code, Clean Architecture, Pragmatic Programmer, etc.)
* Algumas boas horas de voo com software em produção
* Algumas boas horas em War Rooms resolvendo problemas que outras pessoas — e você também, principalmente — causaram.

Caso falte algo disso na sua maleta de experiências, recomendo que não siga a partir daqui, e espero que esse texto, ou algo muito melhor, chegue novamente até você daqui um tempo - ou siga, se você quiser...

<br>

# O que esperar a partir daqui?

Diante disso, o que recomendo que você (ou eu) leia? Segue uma lista — em ordem — de livros que considero importantes para entender mais sobre tópicos avançados de software e sistemas distribuídos em diferentes escalas. A sequência vai desde o *“não entendo nada sobre isso, preciso de um direcionamento básico”* até os conteúdos mais densos, com maior profundidade teórica e prática.

Nada aqui é focado em alguma linguagem ou tecnologia específica, pois o objetivo é apresentar conceitos arquiteturais e teóricos que podem ser absorvidos após certa reflexão. Esses conteúdos devem ser mastigados por você e depois aplicados ao seu próprio mundo, ao lado das suas experiências pessoais.

Alguns desses livros nem são técnicos e sequer mencionam tecnologia diretamente, mas fazem sentido dentro do todo. Talvez sejam até os que mais vão agregar à sua formação. Nem todos possuem tradução para o português até o momento, mas, como mencionei, não são recomendados para iniciantes. Ainda que este material possa servir como um mapa, quem vai dar os pulos é você.

Todos os livros e artigos aqui foram lidos por mim. Por isso, há uma curadoria e um cuidado bem grande na seleção. Então, não está `faltando` nada — a menos que eu leia algo novo e decida inserir aqui. É pessoal.


<br>

----

# Domain-Driven Design: Atacando as Complexidades no Coração do Software

![Domain Driven Design](/assets/images/livros/ddd.png)

Começando por um livro que na minha visão deveria estar na lista de "feijão com arroz" dos livros de engenharia. Um dos maiores desafios de se implementar microserviços feitos para reúso, é aprender a identificar domínios de forma efetiva e definir responsabilidades e escopos fechados, e posteriormente lidar com isso na forma de contratos de entrada e saída. 

O Domain Driven Design, por mais que seja de primeiro momento facilmente atrelado a codificação e construção de blocos, não é. Ele te ensina como funciona o particionamento de modelos, definição de escopos, responsabilidades e recursos compartilhados entre esses domínios. 

Pouquíssimo importa a quantidade de patterns e tecnologias que você conhece para a construção de sistemas distribuídos se a funcionalidade desses sistemas tenham responsabilidades compartilhadas, vazadas e fora de escopo sendo efetuadas entre os domínios. 

Por isso considero esse livro do Eric Evans como um dos pontos mais importantes para começar a plantar a semente de como construir sistemas em grande escala pensando em microserviços e com patterns mais avançados. A definição de limites claros é a "chave dos grandes mistérios" dos sistemas distribuídos, embora não se limite a esse tema, claro...

https://amzn.to/4gQzC6o


<br>

----

# Microsserviços Prontos Para a Produção: Construindo Sistemas Padronizados em uma Organização de Engenharia de Software

![Livros](/assets/images/livros/microservicos-prontos-para-producao.png)

Estamos aqui com o primeiro livro literalmente sobre o tema. Esse livro dormiu no meu kindle por meses depois de comprado, pois adquiri ele depois de já algum tempo de vivência em ambientes distribuidos de larga escala. Voltei a atenção pra ele depois que precisei fazer uma lista de recomendação pra um mentorado, e queria garantir que ele estaria lendo algo que realmente fizesse sentido ao nível de conhecimento que ele estava. 

Casou que ele tem um excelente potencial introdutório para a prática. Vai abordar, mas não aprofundar, em tópicos como observabilidade, tracing, comunicação entre serviços, tolerância a falhas, escalabilidade teórica, como inferir esse tipo de prática no ciclo de desenvolvimento e em práticas DevOps e **como encontrar a Lei de Conway de fato e como isso reflete na padronização de arquitetura**. Você não vai ter um material prático aqui, mas vai te mostrar a porta de muitos tópicos que você usar pra se aprofundar depois. 

Recomendo muito que ele seja o primeiro livro a respeito do tema, caso não tenha nenhum tipo de background sobre. Ele é feito pra isso. **O livro é de 2017 e a autora é Susan Rigetti**, que teve uma excelente passagem pela Uber e diversas outras empresas. Hoje ela tem um trabalho muito mais voltado a escrita do que técnico em si. Não sei se foi o famoso surto de tecnologia que te faz largar tudo e "criar patos" numa fazenda, mas se foi, tem meu respeito. 


https://amzn.to/4fKdtG2

<br>

----

# Migrando Sistemas Monolíticos Para Microsserviços: Padrões Evolutivos Para Transformar seu Sistema Monolítico 

![Migrando Sistemas Monolíticos Para Microsserviços](/assets/images/livros/migracao-monolito-microservicos.png)

Este livro, escrito por **Sam Newman em 2020**, é um guia prático e aprofundado sobre como evoluir uma aplicação monolítica — **geralmente robusta, complexa e estável em muitos aspectos** — para uma arquitetura de microsserviços. Aprender a decompor serviços e entender como subdividir domínios é talvez a tarefa mais importante na hora de realizar uma migração para microserviços em ambientes evolutivos. E executar a migração de forma responsável e gradual tende a ser um exercício complexo de muitas áreas corporativas. 

**Saber decompor fronteiras é uma tarefa do livro Domain Driven Design**, mas esse livro vai reforçar esses conceitos e te aproximar da parte técnica da tarefa te dando **ferramental de migração e evolução**.

Eu sinceramente não sentei para ler esse livro do tipo *"olha, vamos passar algumas horas aqui lendo esse cara nesse domingo maravilhoso"*, mas tratei ele como um livro de cabeceira, onde procurei os capítulos pontualmente conforme tinha dúvidas e precisei de um direcionamento a respeito. Depois de 2 anos acabei que li ele por completo. 

Nem todo mundo tem a oportunidade de passar por um processo de decomposição de algo maior para vários outros "algos" menores. Muitos já entram em ambientes monolíticos estáveis e outros já entram em ambientes já decompostos de alguma forma, e em muitos locais o pulo de monolitos para microserviços nem faz sentido e nem é tratado como uma forma evolutiva. Mas ter uma ordem lógica de raciocinio a respeito pode ajudar em ambos os cenários. 

https://amzn.to/4gRUASz


<br>

---- 

# Arquitetura de Software: as Partes Difíceis: Análises Modernas de Trade-off Para Arquiteturas Distribuídas

![Arquitetura de Software](/assets/images/livros/arquitetura-partes-dificeis.png)

Arquitetura de Software: As partes difíceis é um livro bem importante na minha carreira, pois aborda e detalha muitos tópicos que consideram uma transição real de um sistema monolitico para um distribuído, abordando uma série muito grande de disciplinas, desde modelagem de dados, modularização, cuidados com a codebase e seus times responsáveis até patterns como Saga, tipos de banco de dados, CAP, comunicação entre microserviços e cuidados com resiliência. 

Esse **livro ganhou uma tradução em PT-BR agora em 2024**. Tenho as duas na minha estante, recomendo qualquer que seja. E**scrito por Neal Ford, Mark Richards, Pramod Sadalage e Zhamak Dehghani, ele aborda com um pouco mais de detalhes** o tipo de ferramental que você precisa ter para entender sistemas distribuídos complexos com excelência. Muito mais portas abertas pra você aqui. 

https://amzn.to/3Dy3C8O

----

# Engenharia de Confiabilidade do Google: Como o Google Administra Seus Sistemas de Produção

![Engenharia de Confiabilidade](/assets/images/livros/engenharia-confiabilidade-google.png)

O **Google criou o conceito de Site Reliability Engineering ao fundir tarefas tradicionais de operação e infraestrutura com a mentalidade de desenvolvimento de software**, e os passos iniciais abordados por produtos que necessitavam de engenharia de confiabilidade está compilada nesse primeiro livro sobre o tema. 

Chuto que esse é **o livro mais importante da minha carreira**, em termos de ser um divisor de águas sobre como modernizar e focar meu conhecimento. **Lidar com sistemas complexos, é por definição, complexo...** E entender a fundo as disciplinas de **confiabilidade, resiliência, projetar fallbacks e acompanhar a saúde de serviços avaliando sempre oportunidades de melhoria e excelência operacional é a chave para construir e manter uma vida saudável em microserviços e sistemas distribuídos**. 

Creio que o que o SRE significa hoje para o mercado, é a porta e também a chave de todos os temas complexos que um engenheiro precisa conhecer. É importante você conhecer o segundo passo após construir coisas, que é mantê-las no ar performando da melhor forma possível com resiliência e tolerância a falhas. 

**Difícil não é fazer. Difícil é manter no ar depois de feito.** Aqui você será apresentado para conceitos extremamente importantes como tolerância a falhas, resiliência como cultura organizacional, Service Levels, Error Budgets e etc. Praticamente o mundo corporativo de larga escala bebe dessa fonte. 

https://amzn.to/4a0Z8DL

----

# Antifrágil: Coisas que se beneficiam com o caos

![Antifrágil](/assets/images/livros/antifragil.png)

**É praticamente impossível você ter saído pra beber comigo e não ter me ouvido falar sobre antifragilidade em tecnologia**. Eu faço essa associação sobre SRE, confiabilidade com antifrágilidade desde 2017, no mínimo. A primeira vez que li associei diretamente o tema pra coisas que eu fazia no dia a dia que visavam garantir performance, resiliência e excelência operacional, e fez mais sentido ainda quando entrei de cabeça no setor bancário em times de tecnologia de missão crítica. 

Sim, esse é um dos livros citados no começo do texto que não são de tecnologia e nem sequer citam qualquer coisa do tipo. **Escrito em 2012 por Nassim Nicholas Taleb**, um matemático analista de riscos do setor financeiro, ele tenta descrever "**o contrário de frágil",** algo que como uma taça de cristal, se quebra e não consegue mais retornar ao seu estágio original, propondo o inverso como sendo um paralelo a **Hidra de Lerna, que conforme sofre danos e sofre certas adversidades, ganha mais cabeças e fica mais forte** ao invés de algo que recebe danos constantes e não muda, como um diamante. 

Ele propõe também os **"fenômenos dos cisnes negros"**, inclusive tem um livro que fala só disso, caso tenha interesse. Que são fenômenos aleatórios e adversos que mudam completamente a realidade ao redor, e tem uma característica muito engraçada que é a sensação de serem facilmente previsíveis, depois que ninguém previu...

Esse tipo de literatura externa a tecnologia tem muito a agregar no dia a dia se interpretado com certos olhos. Esse livro mudou a forma como eu trabalho, e indico pra todo mundo que já tenha uma certa kilometragem rodada propondo essa associação que fiz. 

https://amzn.to/3W0LlYf


----

# Criando Microsserviços: Projetando sistemas com componentes menores e mais especializados 

![Criando Microsserviços](/assets/images/livros/criando-microservicos.png)

https://amzn.to/3VZ62no

----

# Release It!: Design and Deploy Production-Ready Software

![Release-it](/assets/images/livros/release-it.png)

https://amzn.to/3PjqlrO

----

# Designing Data-Intensive Applications: The Big Ideas Behind Reliable, Scalable, and Maintainable Systems

![Data Intensive](/assets/images/livros/data-intensive.png)

https://amzn.to/3Phc7Ic

----

# Building Event-Driven Microservices: Leveraging Organizational Data at Scale

![Event Driven](/assets/images/livros/event-driven.png)

https://amzn.to/41TYQN2

----

# The Site Reliability Workbook: Practical Ways to Implement SRE

![The Site Reliability Workbook](/assets/images/livros/sre-workbook.png)

https://amzn.to/400lDUK


----

# Building Secure and Reliable Systems: Best Practices for Designing, Implementing, and Maintaining Systems

![Building Secure and Reliable Systems](/assets/images/livros/secure-reliable-systems.png)

https://amzn.to/3BSu78D

----

# Ludwig Von Bertalanffy - Teoria Geral dos Sistemas

![Teoria Geral dos Sistemas](/assets/images/livros/teoria-geral-dos-sistemas.png)

https://sebociadosaber.com.br/produtos/ludwig-von-bertalanffy-teoria-geral-dos-sistemas/?variant=1067981702&pf=mc&srsltid=AfmBOopaxgIf_X8Ai6zIViQ8tbrb5MxPBkbao2geuh5pE3Lj1xAwiH-L0n8