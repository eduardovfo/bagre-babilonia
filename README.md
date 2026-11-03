# Bagre da Babilônia

Protótipo de futebol cômico para Android, em português, sem serviços externos ou bibliotecas de execução. Níveis contínuos: cada gol avança um nível e cada erro permite repetir o mesmo desafio. Obstáculos crescem e novos cones aparecem, sempre preservando uma passagem verificada; a força exigida aumenta gradualmente. Inclui mira por arraste, força, cadarço solto, desvio de canela, vento e recorde local. Os erros dependem da mira, força e obstáculo anunciado: todos os níveis permitem gol.

## Jogar no computador

Na raiz do projeto, execute:

```sh
python3 -m http.server 8080 --directory app/src/main/assets
```

Abra http://localhost:8080. Arraste a bola para cima, na direção do gol, e solte. O deslocamento horizontal define a mira. A linha pontilhada mostra o caminho incluindo os desvios, e o alvo fica verde quando o chute está dentro do gol. A distância vertical define a força; excesso de força pode isolar ou causar tropeço. Espaço executa um chute central com força média. No celular, use o toque.

## Android

Abra esta pasta no Android Studio, instale o SDK Android 35 e sincronize o Gradle. Use JDK 17 ou superior e Gradle 8.9 para o Android Gradle Plugin 8.7.3. O projeto não inclui Gradle Wrapper; Android Studio pode usar uma instalação local de Gradle 8.9. Alternativamente, com Gradle instalado, execute `gradle wrapper --gradle-version 8.9` e depois `./gradlew assembleDebug`.

Execute o módulo `app` em um dispositivo/emulador Android 6 ou superior. O APK fica em `app/build/outputs/apk/debug/app-debug.apk`. A aplicação carrega os arquivos locais em um WebView sem permissão de internet.

## Estado do protótipo

Bola procedural inspirada na Trionda (branca, vermelha, verde e azul, com detalhes dourados), com giro no chute. Arte procedural em Canvas e interface adaptada ao toque. Sem áudio, anúncios ou compras. Recorde salvo no armazenamento local quando disponível. Ainda requer teste de compilação e teste em dispositivo Android.


Progressão inicial: nível 1 com gol aberto; nível 2 com barreira de um jogador; nível 3 com a mesma barreira e goleiro, que escolhe esquerda ou direita aleatoriamente ao chutar, independentemente da mira. Chutes para o lado escolhido são defendidos; erros mantêm o nível.
