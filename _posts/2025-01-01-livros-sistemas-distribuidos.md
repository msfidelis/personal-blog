---
layout: post
image: assets/images/recomendacao-sistemas-distribuidos.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: Um Guia de Literatura Para Sistemas Distribuídos (e o porquê eu não quero que você o siga)
---

**Esse não é um artigo comum aqui do blog****. Na verdade, é o tipo de material que eu sou mais relutante em produzir:** uma recomendação. Não gosto de dar recomendações gerais porque isso presume muitas coisas sobre muitas pessoas ao mesmo tempo, ignorando peculiaridades, nuances e momentos distintos de cada indivíduo, que pode ler e interpretar algo de formas diferentes. Na verdade, esse receio molda a maneira como prefiro acompanhar a carreira das pessoas no dia a dia e conduzir mentorias: de forma pontual, direta e olhando para a pessoa que está à minha frente, sem presumir nenhum molde genérico do tipo *“faça assim que vai dar certo pra você”*. **A coisa menos genérica que existe é gente**... Gosto de olhar cada pessoa individualmente, caso a caso. Por isso, já desisti várias vezes de escrever um post assim, mas aqui está... O primeiro post do ano.

Inclusive, grande parte do material que trago aqui (para não dizer que é inteiro) representa as principais referências para a **[série de System Design](/categories#system-design)** que estamos desenvolvendo neste blog.


<br>

# Por que você não deveria seguir este roteiro

Recentemente, fiz um exercício típico de fim de ano — *com a mente vazia* —, imaginando uma mentoria comigo mesmo há 6 ou 7 anos, do jeito que mais gosto: **uma mesa de boteco sem crachás**. Olhei para minha prateleira de livros, para o meu histórico no Kindle e montei um roteiro de Matheus para Fidelis.

**Esse é o motivo pelo qual não quero que você siga esse roteiro ao pé da letra**. Porém, fique à vontade para, daqui em diante, usá-lo como recomendação do que lhe agradar aos olhos e adaptá-lo à sua realidade, já que não terei a oportunidade de ajudá-lo(a) tão de perto.

> **Muito importante ressaltar**: Todos os links que direcionam para a Amazon são links de afiliados, mas você pode buscar o recurso onde achar melhor.

Autocrítica é muito legal. Não faço questão de ser um cristal perfeito em pessoa — mesmo sendo movido por um senso constante de autoaperfeiçoamento meio estranho —, e acho que **isso só é possível porque assumo que tenho muito a melhorar o tempo todo**. Tenho muitas dificuldades, até mesmo em áreas nas quais me considero bom. Uma delas é justamente **não saber ensinar conteúdo introdutório**. Reconheço que é uma falha minha; muita gente faz isso extraordinariamente bem, e admiro essas pessoas por esse e outros motivos. É a minha kryptonita. Por isso, vou partir do pressuposto de que você não seja um iniciante.

Presumo, então, que você já tenha uma boa quilometragem em empresas e projetos de software, e que já tenha feito **algumas** coisas que deram certo, e **muitas que deram errado**.

Em termos de conteúdo técnico, parto do princípio de que você já esteja familiarizado(a) com:

- Containers e orquestração, mesmo que básica
- Vivência em alguma cloud, qualquer que seja
- Alguma linguagem de programação (em nível pleno ou sênior+)
- A “literatura feijão com arroz” (Clean Code, Clean Architecture, Pragmatic Programmer, etc.)
- Algumas boas horas de voo com software em produção
- Algumas boas horas em War Rooms resolvendo problemas que outras pessoas — e você também, principalmente — causaram

Caso falte algo disso na sua bagagem de experiências, recomendo que não siga a partir daqui. Espero que este texto, ou algo ainda melhor, chegue novamente até você daqui a um tempo — ou siga, se preferir...


<br>

# O que esperar a partir daqui?

Diante disso, o que recomendo que você (ou eu) leia? Segue uma lista — em ordem — de livros que considero importantes para entender mais sobre tópicos avançados de software e sistemas distribuídos em diferentes escalas. A sequência começa no *“não entendo nada sobre isso, preciso de um direcionamento básico”* e vai até conteúdos mais densos, com maior profundidade teórica e prática.

Nada aqui é focado em alguma linguagem ou tecnologia específica, pois o objetivo é apresentar conceitos arquiteturais e teóricos que podem ser absorvidos após certa reflexão. Esses conteúdos devem ser “mastigados” por você e depois aplicados ao seu próprio mundo, lado a lado com suas experiências pessoais.

Alguns desses livros nem são técnicos e sequer mencionam tecnologia diretamente, mas fazem sentido dentro do todo. Talvez sejam até os que mais vão agregar à sua formação. Nem todos possuem tradução para o português até o momento, mas, como mencionei, não são recomendados para iniciantes. Ainda que este material possa servir como um mapa, quem vai dar os pulos é você.

Todos os livros e artigos aqui foram lidos por mim. Por isso, há uma curadoria e um cuidado bem grande na seleção. Então, não está “faltando” nada — a menos que eu leia algo novo e decida inserir aqui. É pessoal.



<br>

----

# 1. Domain-Driven Design: Atacando as Complexidades no Coração do Software

![Domain Driven Design](/assets/images/livros/ddd.png)

Começo por um livro que, na minha visão, deveria estar na lista de “feijão com arroz” da engenharia de software. Um dos maiores desafios ao implementar microserviços voltados ao reúso é aprender a identificar domínios de forma efetiva, definir responsabilidades, delimitar escopos e depois lidar com isso na forma de contratos de entrada e saída.

O Domain-Driven Design, **por mais que, em um primeiro momento, seja facilmente associado à codificação e construção de blocos, não é bem assim**. Ele ensina como funciona o particionamento de modelos, a definição de escopos, responsabilidades e recursos compartilhados entre esses domínios.

Pouco importa quantos patterns e tecnologias você conheça para construir sistemas distribuídos se a funcionalidade desses sistemas tiver responsabilidades compartilhadas, fora de escopo ou “vazadas” entre os domínios.

Por isso, considero este **livro de Eric Evans** um dos pontos mais importantes para começar a plantar a semente de como construir sistemas em grande escala, pensando em microserviços e padrões mais avançados. A definição de limites claros é a *“chave dos grandes mistérios”* dos sistemas distribuídos — embora o conceito não se limite apenas a esse tema, é claro...


**[Link do Livro:  Domain-Driven Design: Atacando as Complexidades no Coração do Software - Amazon](https://amzn.to/4gQzC6o)**


<br>

----

# 2. Microsserviços Prontos Para a Produção: Construindo Sistemas Padronizados em uma Organização de Engenharia de Software

![Livros](/assets/images/livros/microservicos-prontos-para-producao.png)

Estamos aqui com o primeiro livro literalmente sobre o tema. Esse livro ficou no meu Kindle por meses após a compra, pois o adquiri depois de já ter certa vivência em ambientes distribuídos de larga escala. Voltei minha atenção para ele quando precisei montar uma lista de recomendações para um mentorado e queria garantir que ele leria algo que realmente fizesse sentido para o nível de conhecimento em que se encontrava.

Acontece que ele tem um excelente potencial introdutório para a prática. Ele aborda — mas não aprofunda — tópicos como observabilidade, tracing, comunicação entre serviços, tolerância a falhas, escalabilidade teórica, como inserir esse tipo de prática no ciclo de desenvolvimento e em práticas DevOps e **como descobrir a Lei de Conway na prática e entender como isso reflete na padronização de arquitetura**. Você não terá um material extremamente prático aqui, mas terá a porta de entrada para muitos assuntos que podem ser explorados em maior profundidade depois.

Recomendo bastante que seja o primeiro livro sobre o tema, caso você não tenha nenhum tipo de conhecimento prévio. Ele foi escrito exatamente para isso. **O livro é de 2017 e a autora é Susan Rigetti**, que teve uma excelente passagem pela Uber e diversas outras empresas. Hoje, ela trabalha muito mais com escrita do que com a parte técnica em si. Não sei se foi o famoso “surto de tecnologia” que faz a pessoa largar tudo e “criar patos” numa fazenda, mas, se foi, tem meu respeito.



**[Link do Livro:  Microsserviços Prontos Para a Produção - Amazon](https://amzn.to/4fKdtG2)**

<br>

----

# 3. Migrando Sistemas Monolíticos Para Microsserviços: Padrões Evolutivos Para Transformar seu Sistema Monolítico 

![Migrando Sistemas Monolíticos Para Microsserviços](/assets/images/livros/migracao-monolito-microservicos.png)

Este livro, escrito por **Sam Newman em 2020**, é um guia prático e aprofundado sobre como evoluir uma aplicação monolítica — **geralmente robusta e complexa, e estável em muitos aspectos** — para uma arquitetura de microsserviços. Aprender a decompor serviços e entender como subdividir domínios é, talvez, a tarefa mais importante na hora de realizar uma migração para microsserviços em ambientes evolutivos. E executar essa migração de forma responsável e gradual costuma ser um exercício complexo que envolve várias áreas corporativas.

**Saber decompor fronteiras é tema central em Domain-Driven Design**, mas este livro reforça esses conceitos e aproxima você da parte técnica dessa tarefa, **oferecendo ferramentas de migração e evolução**.

Sinceramente, não cheguei a sentar e ler este livro pensando *“vou passar algumas horas aqui lendo esse cara neste domingo maravilhoso”*. Em vez disso, tratei-o como um livro de cabeceira, recorrendo a capítulos específicos sempre que surgiam dúvidas e eu precisava de um direcionamento. Depois de 2 anos, acabei lendo-o por completo.

Nem todo mundo tem a oportunidade de participar de um processo de decomposição em que algo grande é dividido em várias partes menores. Muitos profissionais já chegam a ambientes monolíticos estáveis, enquanto outros entram em cenários já decompostos de alguma forma. Em muitos lugares, a transição de monólitos para microserviços nem faz sentido ou não é tratada como um caminho evolutivo. Mas ter uma ordem lógica de raciocínio a respeito pode ajudar em ambos os cenários.

**[Link do Livro: Migrando Sistemas Monolíticos Para Microsserviços - Amazon ](https://amzn.to/4gRUASz)**


<br>


----

# 4. Engenharia de Confiabilidade do Google: Como o Google Administra Seus Sistemas de Produção

![Engenharia de Confiabilidade](/assets/images/livros/engenharia-confiabilidade-google.png)

O **Google criou o conceito de Site Reliability Engineering (SRE) ao fundir tarefas tradicionais de operação e infraestrutura com a mentalidade de desenvolvimento de software**, e os passos iniciais adotados por produtos que exigiam engenharia de confiabilidade estão compilados neste primeiro livro sobre o tema.

Arrisco dizer que este é **o livro mais importante da minha carreira**, por representar um divisor de águas na forma de modernizar e direcionar meu conhecimento. **Lidar com sistemas complexos é, por definição, algo complexo...** E compreender a fundo as disciplinas de **confiabilidade, resiliência, projeto de fallbacks e acompanhamento da saúde de serviços, sempre avaliando oportunidades de melhoria e excelência operacional, é a chave para construir e manter uma vida saudável em microserviços e sistemas distribuídos**.

Acredito que o significado de SRE para o mercado hoje é tanto a porta de entrada quanto a chave para todos os temas complexos que um(a) engenheiro(a) precisa conhecer. É fundamental entender o segundo passo após construir algo: **mantê-lo no ar**, em alto desempenho, com resiliência e tolerância a falhas.

**Difícil não é fazer. Difícil é manter no ar depois de feito.** Aqui, você será apresentado a conceitos extremamente importantes, como tolerância a falhas, resiliência como cultura organizacional, Service Levels, Error Budgets etc. Praticamente todo o mercado corporativo de larga escala bebe dessa fonte.

**[Link do Livro:  Engenharia de Confiabilidade do Google - Amazon](https://amzn.to/4a0Z8DL)**


----

# 5. Criando Microsserviços: Projetando sistemas com componentes menores e mais especializados

![Criando Microsserviços](/assets/images/livros/criando-microservicos.png)

O segundo livro de Sam Newman nesta lista, lançado em 2022, compartilha as experiências e práticas que o autor acumulou ao longo dos anos ajudando empresas a migrar de sistemas monolíticos para arquiteturas distribuídas, compostas por serviços menores e mais especializados. Como um sucessor natural do livro **Migrando Sistemas Monolíticos Para Microsserviços**, aqui encontramos pontos adicionais sobre segurança, zero-trust, modelos de monólitos, modelos de microserviços e, é claro, uma atualização da visão do autor em relação ao primeiro livro.

*"Mas eu posso ler só este e pular o primeiro que você citou?"* — Poder, você pode. Mas, como comentei, não quero que você siga minha lista à risca. Eu, particularmente, não pularia.


**[Link do Livro:  Criando Microsserviços - Amazon](https://amzn.to/3VZ62no)**

----

# 6. Antifrágil: Coisas que se beneficiam com o caos

![Antifrágil](/assets/images/livros/antifragil.png)

**É praticamente impossível você ter saído para beber comigo e não ter me ouvido falar sobre antifragilidade em tecnologia**. Desde, no mínimo, 2017, faço essa associação entre SRE, confiabilidade e antifragilidade. Na primeira vez em que li o livro, associei o tema diretamente às atividades que eu exercia no dia a dia para garantir performance, resiliência e excelência operacional. A correlação se tornou ainda mais forte quando entrei de cabeça no setor bancário, em times de tecnologia de missão crítica.

Sim, este é um dos livros que citei no começo do texto como não tendo relação direta com tecnologia — sequer menciona qualquer aspecto técnico. **Escrito em 2012 por Nassim Nicholas Taleb**, um matemático analista de riscos do setor financeiro, o autor tenta descrever **“o contrário de frágil”**. Algo que, tal qual uma taça de cristal, quando frágil, se quebra e não volta ao estado original. Já o **oposto** seria comparado à **Hidra de Lerna**, que, ao sofrer danos e adversidades, ganha mais cabeças e fica ainda mais forte — em contraste com algo que sofre danos constantes, como um diamante, mas não se transforma.

Taleb também propõe os **“fenômenos dos cisnes negros”** (ele tem um livro inteiro dedicado só a isso, caso tenha interesse). São fenômenos aleatórios e adversos que mudam completamente a realidade ao redor, e têm a peculiaridade de parecerem “facilmente previsíveis” depois que ninguém os previu de fato...

Esse tipo de literatura, que não é voltada especificamente à tecnologia, agrega muito ao nosso dia a dia se interpretado com certos olhos. Esse livro mudou a forma como eu trabalho, e indico a todos que já tenham uma certa quilometragem percorrida, propondo a mesma associação que fiz.

**[Link do Livro:  Antifrágil: Coisas que se beneficiam com o caos - Amazon](https://amzn.to/3W0LlYf)**


---- 

# 7. Arquitetura de Software: As Partes Difíceis — Análises Modernas de Trade-off Para Arquiteturas Distribuídas

![Arquitetura de Software](/assets/images/livros/arquitetura-partes-dificeis.png)

**Arquitetura de Software: As Partes Difíceis** é um livro extremamente importante na minha carreira, pois aborda e detalha muitos aspectos que envolvem uma transição real de um sistema monolítico para um ambiente distribuído. Ele cobre uma ampla variedade de disciplinas, desde modelagem de dados, modularização e cuidados com a base de código e os times responsáveis, até padrões como Saga, diferentes tipos de banco de dados, o teorema CAP, comunicação entre microserviços e cuidados relacionados à resiliência.

Este **livro ganhou uma tradução para o português do Brasil agora, em 2024**. Tenho as duas versões na minha estante e recomendo qualquer uma delas. **Escrito por Neal Ford, Mark Richards, Pramod Sadalage e Zhamak Dehghani**, ele aprofunda o tipo de ferramenta de que você precisa para entender sistemas distribuídos complexos com excelência. Aqui, você encontrará ainda mais “portas abertas” para explorar.

**[Link do Livro:  Arquitetura de Software: As Partes Difíceis - Amazon](https://amzn.to/3Dy3C8O)**


----

# 8. Release It!: Design and Deploy Production-Ready Software

![Release-it](/assets/images/livros/release-it.png)

Ganhei este livro de presente do meu amigo Carlos Panato, uma das minhas maiores referências no mercado. E vou guardá-lo para sempre, pois expandiu muito meu repertório em determinados assuntos.

Aqui, **não falamos apenas sobre construção de software**, mas também de diversos processos que permeiam esse tema, **aumentando o que entendemos como engenharia**, incluindo padrões de resiliência, postmortems, escalabilidade, redes (networking), gestão de capacidade (capacity) etc.

A versão que possuo é de 2012. Novas edições foram lançadas, mas, sinceramente, não as li. Continuo com a minha cópia do coração, que ainda me satisfaz plenamente. **Escrito por Michael T. Nygard**, recomendo fortemente esse livro, apesar de não existir uma versão em português até o momento em que escrevo este artigo. É, talvez, uma das obras mais importantes que você encontrará nesta lista.

**[Link do Livro:  Release It!: Design and Deploy Production-Ready Software - Amazon](https://amzn.to/3PjqlrO)**


----

# 9. Designing Data-Intensive Applications: The Big Ideas Behind Reliable, Scalable, and Maintainable Systems

![Data Intensive](/assets/images/livros/data-intensive.png)

Aqui, **entramos definitivamente em uma lista de livros mais complexos**. Este é, sem dúvidas, o livro que mais consulto no meu dia a dia atualmente. Li esse cara pela primeira vez em 2022, depois em 2023, e revisitei vários de seus capítulos em 2024. Desde que encontrei meu caminho na jornada atual — no meu emprego atual —, aprender a lidar com aplicações de uso intensivo de dados ou que realmente exigem alto throughput tem sido o desafio mais instigante que já vivenciei. E posso dizer que essa jornada ainda está em andamento: estou naquela sensação constante e empolgante de aprender algo novo e, de quebra, descobrir mais umas quatro coisas que ainda desconheço na sequência.

**Tanto este livro quanto o blog do Martin Kleppmann são incríveis e super recomendados para qualquer pessoa que queira se aprofundar em assuntos complexos** de arquitetura e engenharia de software. Aqui, abordamos design de databases, replicação, particionamento, SSTables, LSM Trees, B-Trees, compressão, além de formatos e protocolos de comunicação.

É um dos meus livros preferidos desta lista. E ele está no final por um motivo: não dê um passo maior que a perna.

**[Link do Livro: Designing Data-Intensive Applications - Amazon](https://amzn.to/3Phc7Ic)**


----

# 10. Building Event-Driven Microservices: Leveraging Organizational Data at Scale

![Event Driven](/assets/images/livros/event-driven.png)

Segundo passo relacionado a temas mais complexos.

Na jornada até aqui, **você já chegou além dos modelos síncronos**. Seja por conta da literatura proposta ou não, você já tem **ferramental suficiente** para avaliar, sugerir e implementar soluções envolvendo mensageria e eventos. O *Building Event-Driven Microservices*, **escrito por Adam Bellemare**, é um guia prático e estratégico sobre como projetar e implementar sistemas baseados em eventos de forma mais estruturada, com várias dicas e experiências **valiosas demais** — algo **muito difícil** de se encontrar fora de um bate-papo informal com quem já passou por algo parecido.

Arquiteturas event-driven viabilizam grande parte das propostas e estratégias de larga escala para sistemas distribuídos. Adicionar esse tipo de compreensão e experiência ao seu “arsenal” agregará muito no momento de projetar arquiteturas corporativas complexas, levando em conta tudo que pode dar certo e, principalmente, o que pode dar errado em ambientes orientados a eventos.

Aqui, você encontrará dicas de como lidar com práticas DevOps, pipelines de dados e fluxos de negócio orientados a eventos, além de como realizar tratativas de erros e compensações. **É uma leitura bem madura, que provavelmente precisará ser revisitada algumas vezes.**

**[Link do Livro:  Building Event-Driven Microservices - Amazon](https://amzn.to/41TYQN2)**



----

# 11. The Site Reliability Workbook: Practical Ways to Implement SRE

![The Site Reliability Workbook](/assets/images/livros/sre-workbook.png)

Dando o próximo passo em relação à literatura mais complexa, aqui avançamos no que foi visto sobre Engenharia de Confiabilidade de sistemas complexos.

O *Site Reliability Workbook* foi escrito e organizado pelos mesmos editores e autores de **Engenharia de Confiabilidade do Google** — entre eles **Betsy Beyer, Niall Richard Murphy, David K. Rensin, Kent Kawahara e Stephen Thorne**. Este livro foca em orientações mais práticas e exemplos mais próximos da realidade de como aplicar os princípios de SRE no dia a dia das equipes de engenharia. Se o primeiro livro introduz a filosofia e os pilares do *Site Reliability Engineering*, o *Workbook* adota uma postura mais “mão na massa”, oferecendo uma abordagem ainda mais prática na jornada.

*"Posso ler só este e pular o Engenharia de Confiabilidade do Google?"* — Desta vez, não. Definitivamente, não...

**[Link do Livro: The Site Reliability Workbook - Amazon](https://amzn.to/400lDUK)**




----

# 12. Building Secure and Reliable Systems: Best Practices for Designing, Implementing, and Maintaining Systems

![Building Secure and Reliable Systems](/assets/images/livros/secure-reliable-systems.png)

Este **livro serviu como a maior base para a série de System Design** e também embasa o futuro livro que planejo escrever sobre o tema. **Building Secure and Reliable Systems** é o mais importante desta lista e **precisa ser respeitado na ordem**, pois o considero o ponto de chegada, onde amarraremos tudo o que vimos até agora. **Ele não é o mais complexo**, mas a visão que apresenta exige uma certa base funcional para ser plenamente compreendida.

Em geral, segurança, DevOps e confiabilidade costumam ser tratadas como áreas distintas em grandes organizações — ou como “tudo igual” em empresas de pequeno e médio porte. Neste livro, **os autores mostram como essas perspectivas se complementam ao longo de todo o processo de desenvolvimento e operação**, reforçando que não existe sistema realmente confiável se não for também seguro, e vice-versa — e explicando como lidar com isso de forma incremental e com aprendizado contínuo.

Também foi publicado por profissionais do Google, como **Heather Adkins, Betsy Beyer, Paul Blankinship, Piotr Lewandowski, Ana Oprea e Adam Stubblefield**. Dos três livros que discutem temas similares, este é o mais maduro e sênior, voltado tanto para operações **quanto para cargos estratégicos Staff+**.

**[Link do Livro: Building Secure and Reliable Systems - Amazon](https://amzn.to/3BSu78D)**



----

# 13. Ludwig Von Bertalanffy – Teoria Geral dos Sistemas (Bônus)

![Teoria Geral dos Sistemas](/assets/images/livros/teoria-geral-dos-sistemas.png)

Ao observar organismos vivos, Ludwig Von Bertalanffy percebeu que o todo não pode ser compreendido apenas pela soma das partes. Fatores como feedback e adaptação mostram que a organização global de um sistema influencia diretamente seus componentes. É o que, hoje em dia, chamamos popularmente de **visão holística**.

Tive contato com este **raro** livro durante meu MBA de Data Science e Analytics, na disciplina de Pesquisa Operacional. Ele forneceu uma **forma complexa e completa de avaliar qualquer sistema**, seja ele tecnológico ou o sistema de trânsito de grandes centros. Afinal, **tudo no mundo é um sistema**.

Este livro é realmente raro e **muito difícil** de encontrar. Achei minha edição em um sebo digital; ela é mais velha do que eu — a segunda edição, de 1975.

**Recomendo-o como uma maneira de entender tanto sistemas complexos quanto a própria organização em que você está inserido, sem mencionar uma única palavra sobre tecnologia.**


**[Link do Livro: Ludwig Von Bertalanffy - CIA do Saber](https://sebociadosaber.com.br/produtos/ludwig-von-bertalanffy-teoria-geral-dos-sistemas/?variant=1067981702&pf=mc&srsltid=AfmBOopaxgIf_X8Ai6zIViQ8tbrb5MxPBkbao2geuh5pE3Lj1xAwiH-L0n8)**

---- 

Por enquanto, é isso! 