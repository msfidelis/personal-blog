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

https://amzn.to/4gQzC6o

----

# Microsserviços Prontos Para a Produção: Construindo Sistemas Padronizados em uma Organização de Engenharia de Software

![Livros](/assets/images/livros/microservicos-prontos-para-producao.png)

Estamos aqui com o primeiro livro literalmente sobre o tema. Esse livro dormiu no meu kindle por meses depois de comprado, pois adquiri ele depois de já algum tempo de vivência em ambientes distribuidos de larga escala. Voltei a atenção pra ele depois que precisei fazer uma lista de recomendação pra um mentorado, e queria garantir que ele estaria lendo algo que realmente fizesse sentido ao nível de conhecimento que ele estava. 

Casou que ele tem um excelente potencial introdutório para a prática. Vai abordar, mas não aprofundar, em tópicos como observabilidade, tracing, comunicação entre serviços, tolerância a falhas, escalabilidade teórica, como inferir esse tipo de prática no ciclo de desenvolvimento e em práticas DevOps e **como encontrar a Lei de Conway de fato e como isso reflete na padronização de arquitetura**. Você não vai ter um material prático aqui, mas vai te mostrar a porta de muitos tópicos que você usar pra se aprofundar depois. 

Recomendo muito que ele seja o primeiro livro a respeito do tema, caso não tenha nenhum tipo de background sobre. Ele é feito pra isso. **O livro é de 2017 e a autora é Susan Rigetti**, que teve uma excelente passagem pela Uber e diversas outras empresas. Hoje ela tem um trabalho muito mais voltado a escrita do que técnico em si. Não sei se foi o famoso surto de tecnologia que te faz largar tudo e "criar patos" numa fazenda, mas se foi, tem meu respeito. 


https://amzn.to/4fKdtG2

----

# Migrando Sistemas Monolíticos Para Microsserviços: Padrões Evolutivos Para Transformar seu Sistema Monolítico 



https://amzn.to/4gRUASz

---- 

# Arquitetura de Software: as Partes Difíceis: Análises Modernas de Trade-off Para Arquiteturas Distribuídas

![Arquitetura de Software](/assets/images/livros/arquitetura-partes-dificeis.png)

https://amzn.to/3Dy3C8O

----

# Engenharia de Confiabilidade do Google: Como o Google Administra Seus Sistemas de Produção

![Engenharia de Confiabilidade](/assets/images/livros/engenharia-confiabilidade-google.png)

https://amzn.to/4a0Z8DL

----

# Antifrágil: Coisas que se beneficiam com o caos

![Antifrágil](/assets/images/livros/antifragil.png)

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