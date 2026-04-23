/**
 * Story Translations Library
 * Provides multilingual story content for different themes and languages
 */

export const storyTranslations = {
  en: {
    adventure: {
      title: (name) => `${name}'s Amazing Adventure`,
      arcs: (name) => [
        `${name} wakes up to discover an ancient map hidden in the attic!`,
        `Following the map, ${name} ventures into an enchanted forest full of mysteries.`,
        `${name} befriends a wise owl who reveals secrets about the hidden treasure.`,
        `Deep in the forest, ${name} encounters challenges but never loses courage.`,
        `${name} discovers a hidden cave sparkling with magical crystals!`,
        `Inside the cave, ${name} finds an ancient guardian of the treasures.`,
        `With quick thinking and bravery, ${name} solves the guardian's riddle.`,
        `The treasures are revealed - but ${name} discovers the real treasure is friendship!`,
        `${name} helps other lost travelers find their way home with the map.`,
        `Heroes return home celebrated for their bravery and kindness.`
      ]
    },
    fantasy: {
      title: (name) => `${name} in the Magical Kingdom`,
      arcs: (name) => [
        `${name} finds a shimmering portal leading to the Magic Kingdom!`,
        `A friendly dragon named Sparkle greets ${name} at the kingdom gates.`,
        `${name} learns about the ancient magic that protects the kingdom.`,
        `The kingdom's magic is fading - only a pure heart can help!`,
        `${name} sets out on a quest to restore the Crystal of Light.`,
        `Along the way, ${name} makes friends with elves, fairies, and talking animals.`,
        `Together, they face magical challenges and puzzles.`,
        `${name} discovers their inner magic is stronger than ever believed!`,
        `With friends' help, ${name} restores the Crystal of Light.`,
        `The kingdom celebrates ${name} as a true hero of magic!`
      ]
    }
  },
  
  es: {
    adventure: {
      title: (name) => `La Increíble Aventura de ${name}`,
      arcs: (name) => [
        `¡${name} se despierta y descubre un antiguo mapa escondido en el ático!`,
        `Siguiendo el mapa, ${name} se aventura en un bosque encantado lleno de misterios.`,
        `${name} se hace amigo de una lechuza sabia que revela secretos del tesoro oculto.`,
        `En lo profundo del bosque, ${name} enfrenta desafíos pero nunca pierde valor.`,
        `¡${name} descubre una cueva oculta que brilla con cristales mágicos!`,
        `Dentro de la cueva, ${name} encuentra un antiguo guardián de los tesoros.`,
        `Con rapidez mental y valentía, ${name} resuelve el acertijo del guardián.`,
        `Se revelan los tesoros, pero ${name} descubre que ¡la verdadera riqueza es la amistad!`,
        `${name} ayuda a otros viajeros perdidos a encontrar el camino a casa.`,
        `Los héroes regresan a casa celebrados por su valentía y bondad.`
      ]
    },
    fantasy: {
      title: (name) => `${name} en el Reino Mágico`,
      arcs: (name) => [
        `¡${name} encuentra un portal centelleante que lleva al Reino Mágico!`,
        `Un dragón amable llamado Sparkle saluda a ${name} en las puertas del reino.`,
        `${name} aprende sobre la magia antigua que protege el reino.`,
        `¡La magia del reino se está desvaneciendo - solo un corazón puro puede ayudar!`,
        `${name} se embarcan en una búsqueda para restaurar el Cristal de Luz.`,
        `En el camino, ${name} hace amigos con elfos, hadas y animales que hablan.`,
        `Juntos enfrentan desafíos mágicos y acertijos.`,
        `¡${name} descubre que su magia interior es más fuerte de lo que jamás creyó!`,
        `Con la ayuda de amigos, ${name} restaura el Cristal de Luz.`,
        `¡El reino celebra a ${name} como un verdadero héroe mágico!`
      ]
    }
  },

  fr: {
    adventure: {
      title: (name) => `L'Incroyable Aventure de ${name}`,
      arcs: (name) => [
        `${name} se réveille et découvre une ancienne carte cachée dans le grenier!`,
        `En suivant la carte, ${name} s'aventure dans une forêt enchantée pleine de mystères.`,
        `${name} se lie d'amitié avec une chouette sage qui révèle les secrets du trésor caché.`,
        `Au plus profond de la forêt, ${name} fait face à des défis mais ne perd jamais courage.`,
        `${name} découvre une grotte cachée scintillant de cristaux magiques!`,
        `À l'intérieur de la grotte, ${name} trouve un ancien gardien des trésors.`,
        `Avec de la perspicacité et du courage, ${name} résout l'énigme du gardien.`,
        `Les trésors sont révélés, mais ${name} découvre que la vraie richesse est l'amitié!`,
        `${name} aide d'autres voyageurs perdus à trouver le chemin du retour.`,
        `Les héros reviennent à la maison célébrés pour leur bravoure et leur bonté.`
      ]
    },
    fantasy: {
      title: (name) => `${name} dans le Royaume Magique`,
      arcs: (name) => [
        `${name} trouve un portail scintillant menant au Royaume Magique!`,
        `Un dragon amical nommé Sparkle accueille ${name} aux portes du royaume.`,
        `${name} apprend la magie ancienne qui protège le royaume.`,
        `La magie du royaume s'estompe - seul un cœur pur peut aider!`,
        `${name} se lance dans une quête pour restaurer le Cristal de Lumière.`,
        `En chemin, ${name} se fait des amis avec des elfes, des fées et des animaux parlants.`,
        `Ensemble, ils font face à des défis magiques et des énigmes.`,
        `${name} découvre que sa magie intérieure est plus forte qu'il ne l'a jamais cru!`,
        `Avec l'aide de ses amis, ${name} restaure le Cristal de Lumière.`,
        `Le royaume célèbre ${name} comme un véritable héros magique!`
      ]
    }
  },

  de: {
    adventure: {
      title: (name) => `${name}s Großes Abenteuer`,
      arcs: (name) => [
        `${name} wacht auf und entdeckt eine alte Karte, die auf dem Dachboden versteckt ist!`,
        `Der Karte folgend, wagt sich ${name} in einen verzauberten Wald voller Geheimnisse.`,
        `${name} freundet sich mit einer weisen Eule an, die Geheimnisse des verborgenen Schatzes verrät.`,
        `Tief im Wald trifft ${name} auf Herausforderungen, verliert aber nie den Mut.`,
        `${name} entdeckt eine verborgene Höhle, die vor magischen Kristallen funkelt!`,
        `In der Höhle findet ${name} einen alten Wächter der Schätze.`,
        `Mit schnellem Verstand und Mut löst ${name} das Rätsel des Wächters.`,
        `Die Schätze werden enthüllt - aber ${name} entdeckt, dass die wahre Schatz Freundschaft ist!`,
        `${name} hilft anderen verirrten Reisenden, den Weg nach Hause zu finden.`,
        `Helden kehren nach Hause zurück und werden für Tapferkeit und Güte gefeiert.`
      ]
    },
    fantasy: {
      title: (name) => `${name} im Magischen Königreich`,
      arcs: (name) => [
        `${name} findet ein glitzerndes Portal zum Magischen Königreich!`,
        `Ein freundlicher Drache namens Sparkle begrüßt ${name} an den Toren des Königreichs.`,
        `${name} erfährt von der alten Magie, die das Königreich schützt.`,
        `Die Magie des Königreichs verblasst - nur ein reines Herz kann helfen!`,
        `${name} macht sich auf die Suche, um den Kristall des Lichts wiederherzustellen.`,
        `Unterwegs freundet sich ${name} mit Elfen, Feen und sprechenden Tieren an.`,
        `Zusammen bewältigen sie magische Herausforderungen und Rätsel.`,
        `${name} entdeckt, dass seine innere Magie stärker ist als je zuvor!`,
        `Mit Hilfe von Freunden stellt ${name} den Kristall des Lichts wieder her.`,
        `Das Königreich feiert ${name} als einen wahren magischen Helden!`
      ]
    }
  },

  pt: {
    adventure: {
      title: (name) => `A Incrível Aventura de ${name}`,
      arcs: (name) => [
        `${name} acorda e descobre um antigo mapa escondido no sótão!`,
        `Seguindo o mapa, ${name} se aventura em uma floresta encantada cheia de mistérios.`,
        `${name} faz amizade com uma coruja sábia que revela segredos do tesouro escondido.`,
        `No fundo da floresta, ${name} enfrenta desafios mas nunca perde a coragem.`,
        `${name} descobre uma caverna oculta brilhando com cristais mágicos!`,
        `Dentro da caverna, ${name} encontra um antigo guardião dos tesouros.`,
        `Com astúcia e bravura, ${name} resolve o enigma do guardião.`,
        `Os tesouros são revelados - mas ${name} descobre que o verdadeiro tesouro é a amizade!`,
        `${name} ajuda outros viajantes perdidos a encontrar o camino para casa.`,
        `Heróis retornam para casa celebrados por sua bravura e bondade.`
      ]
    },
    fantasy: {
      title: (name) => `${name} no Reino Mágico`,
      arcs: (name) => [
        `${name} encontra um portal brilhante levando ao Reino Mágico!`,
        `Um dragão amigável chamado Sparkle cumprimenta ${name} nos portões do reino.`,
        `${name} aprende sobre a magia antiga que protege o reino.`,
        `A magia do reino está desaparecendo - apenas um coração puro pode ajudar!`,
        `${name} se embarque em uma busca para restaurar o Cristal da Luz.`,
        `Pelo caminho, ${name} faz amigos com elfos, fadas e animais falantes.`,
        `Juntos, eles enfrentam desafios mágicos e enigmas.`,
        `${name} descobre que sua magia interior é mais forte do que jamais acreditou!`,
        `Com ajuda de amigos, ${name} restaura o Cristal da Luz.`,
        `O reino celebra ${name} como um verdadeiro herói mágico!`
      ]
    }
  }
};

/**
 * Get translated story arcs for a given language and theme
 * @param {string} language - Language code (en, es, fr, de, pt)
 * @param {string} theme - Story theme (adventure, fantasy)
 * @param {string} childName - Child's name to personalize story
 * @returns {object} - Translated story with title and arcs
 */
export function getTranslatedStory(language = 'en', theme = 'adventure', childName = 'Child') {
  const supportedLang = storyTranslations[language] || storyTranslations['en'];
  const themeContent = supportedLang[theme] || supportedLang['adventure'];
  
  return {
    title: themeContent.title(childName),
    arcs: themeContent.arcs(childName),
  };
}

/**
 * Get supported languages for story generation
 */
export function getSupportedLanguages() {
  return Object.keys(storyTranslations);
}
