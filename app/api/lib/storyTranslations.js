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
    },
    'animal-adventure': {
      title: (name) => `${name}'s Animal Adventure`,
      arcs: (name) => [
        `${name} meets a soaring eagle who invites them to explore a wide golden valley full of animal friends.`,
        `A gentle elephant helps ${name} cross a sparkling river on the way to a hidden safari trail.`,
        `${name} learns to listen closely to chirping birds, rustling leaves, and the secret language of the jungle.`,
        `When a baby zebra wanders too far, ${name} bravely guides it back through the tall grass.`,
        `Friendly monkeys reveal a glowing lookout where the whole savannah can be seen at sunset.`,
        `${name} discovers that every animal has a gift and that kindness helps them all shine together.`,
        `As the sky turns honey-gold, the animal friends celebrate ${name} with songs, trumpets, and joyful dancing.`,
        `${name} returns home with a full heart, knowing that courage and care make every adventure magical.`,
      ],
    },
    'dino-quest': {
      title: (name) => `${name}'s Dino Quest`,
      arcs: (name) => [
        `${name} spots bright dinosaur footprints leading into a colorful prehistoric valley.`,
        `A cheerful red dinosaur appears and invites ${name} on a roaring adventure across giant ferns and glowing stones.`,
        `${name} rides high above the grasslands while tiny flying dinos swirl through the sky.`,
        `When a baby dinosaur gets stuck near a bubbling stream, ${name} thinks fast and helps it safely across.`,
        `A volcano in the distance lights the clouds while ${name} and their dinosaur friend race toward a hidden crystal ridge.`,
        `${name} discovers that bravery feels even bigger when it is shared with loyal friends.`,
        `At the top of the ridge, a whole herd of smiling dinosaurs cheers for ${name}'s clever heart.`,
        `${name} heads home with dino memories, bright laughter, and a hero-sized smile.`,
      ],
    },
    'goodnight-garage': {
      title: (name) => `${name}'s Goodnight Garage`,
      arcs: (name) => [
        `${name} steps into a cozy garage glowing with warm lights, tiny tools, and toy cars waiting for a bedtime adventure.`,
        `A little yellow car blinks its headlights and asks ${name} for help finding the perfect parking place for the night.`,
        `${name} explores wooden rafters, moonlit windows, and secret shelves full of friendly workshop surprises.`,
        `Together, ${name} and the toy cars organize the garage so every vehicle has a soft and special sleeping spot.`,
        `One tiny red truck feels nervous in the dark, so ${name} creates a comforting trail of golden lights across the floor.`,
        `${name} learns that caring for small things can make a room feel full of wonder and love.`,
        `When the stars appear through the skylight, the whole garage hums a sleepy goodnight song for ${name}.`,
        `${name} leaves the workshop smiling, knowing imagination can make bedtime feel magical.`,
      ],
    },
    'unicorn-magic': {
      title: (name) => `${name}'s Unicorn Magic`,
      arcs: (name) => [
        `${name} wakes to find a silver glow leading up into the clouds where a gentle unicorn is waiting.`,
        `Together they walk through a sky kingdom filled with soft rainbows, floating stars, and moonlit gardens.`,
        `The unicorn shows ${name} how to leave sparkling kindness in every place they visit.`,
        `When a cloud bridge begins to fade, ${name} uses courage and care to help the unicorn restore its light.`,
        `A hidden castle appears beyond the mist, and ${name} discovers a room full of glowing wishes.`,
        `${name} learns that real magic grows strongest in a heart that is brave, joyful, and kind.`,
        `The sky fills with pastel light as the unicorn bows to ${name}, celebrating a new magical hero.`,
        `${name} returns home with stardust dreams, rainbow memories, and a little magic still glowing inside.`,
      ],
    },
    celebration: {
      title: (name) => `${name}'s Family Celebration`,
      arcs: (name) => [
        `${name} wakes up to a day full of happy decorations, warm hugs, and the feeling that something special is about to begin.`,
        `Family members gather with flowers, lights, and joyful smiles to help create a beautiful celebration just for ${name}.`,
        `${name} helps add the final magical touches, turning the space into a bright keepsake moment filled with color and love.`,
        `As music begins to play, ${name} welcomes everyone with confidence and a heart full of excitement.`,
        `One sweet surprise after another reminds ${name} how deeply they are loved by the people around them.`,
        `${name} shares laughter, stories, and meaningful moments that make the entire celebration feel unforgettable.`,
        `When the room glows with warm light and happy cheers, ${name} realizes this day is about love, connection, and treasured memories.`,
        `${name} ends the celebration feeling grateful, celebrated, and surrounded by the people who matter most.`,
      ],
    },
    milestone: {
      title: (name) => `${name}'s Precious Milestone`,
      arcs: (name) => [
        `${name} wakes up to a gentle, joy-filled day where everyone can feel that a special little first is about to be celebrated.`,
        `Loving family members notice how much ${name} has grown and cheer for every tiny new step, smile, and discovery.`,
        `${name} explores the moment with bright eyes while warm encouragement makes everything feel magical and safe.`,
        `A proud first happens, and everyone around ${name} lights up with happy claps, soft laughter, and loving excitement.`,
        `${name} discovers that growing can feel like its own adventure, full of wonder, courage, and sweet surprises.`,
        `Photos, hugs, and happy voices turn the milestone into a keepsake memory the whole family will treasure.`,
        `${name} feels deeply loved while this little moment becomes a very big story in the hearts of everyone nearby.`,
        `${name} ends the day wrapped in celebration, comfort, and the magic of one unforgettable first.`,
      ],
    },
    birthday: {
      title: (name) => `${name}'s Birthday Bash`,
      arcs: (name) => [
        `${name} wakes up to colorful balloons, cheerful music, and a birthday feeling sparkling through the air.`,
        `A beautifully decorated celebration space is waiting, filled with gifts, bright banners, and sweet surprises.`,
        `${name} laughs with delight while loved ones gather to make the day feel extra magical.`,
        `There are candles glowing on a beautiful cake, and everyone waits for ${name}'s big birthday wish.`,
        `${name} opens thoughtful gifts and discovers that each one carries a little piece of love.`,
        `Games, photos, and joyful cheers keep the celebration full of movement, color, and unforgettable energy.`,
        `As the party reaches its happiest moment, ${name} feels proud, loved, and surrounded by pure celebration joy.`,
        `${name} ends the birthday with a heart full of gratitude and memories that will shine for a long time.`,
      ],
    },
    gathering: {
      title: (name) => `${name}'s Festive Gathering`,
      arcs: (name) => [
        `${name} steps into a bright festive gathering where lights, flowers, and joyful voices fill the air.`,
        `Friends and family arrive one by one, bringing warm smiles and making the event feel bigger and brighter.`,
        `${name} moves through the celebration with confidence, greeting everyone and sharing in the happiness of the day.`,
        `Music, decorations, and meaningful traditions make every corner of the gathering feel alive with storybook magic.`,
        `${name} helps bring people together for a moment that feels both elegant and deeply personal.`,
        `Laughter and heartfelt conversations turn the celebration into a memory everyone wants to hold onto.`,
        `As the golden lights glow more softly, ${name} looks around and sees a room full of connection and joy.`,
        `${name} finishes the gathering with a peaceful smile, knowing this beautiful moment will stay close forever.`,
      ],
    },
    tribute: {
      title: (name) => `Why ${name} Is So Loved`,
      arcs: (name) => [
        `${name} begins a beautiful day filled with thoughtful details that celebrate everything people adore about them.`,
        `Warm messages, loving smiles, and meaningful little surprises remind ${name} how much they mean to others.`,
        `Every memory shared becomes a shining scene in a story of gratitude, admiration, and deep affection.`,
        `${name} discovers that even the smallest qualities, like kindness and courage, have touched many hearts.`,
        `A heartfelt tribute grows around ${name}, rich with laughter, tears of joy, and proud celebration.`,
        `The people closest to ${name} speak about the light they bring into everyday life.`,
        `${name} feels wrapped in appreciation and realizes how powerful it is to be truly seen and cherished.`,
        `${name} closes the day with a full heart, knowing love leaves the brightest and most lasting story of all.`,
      ],
    },
    learning: {
      title: (name) => `${name}'s Learning Adventure`,
      arcs: (name) => [
        `${name} steps into a bright learning world where letters, numbers, colors, and shapes happily come to life.`,
        `Friendly alphabet characters wave hello and invite ${name} to join a playful parade full of songs and smiles.`,
        `${name} counts cheerful surprises, from bouncing stars to rolling toy cars, and discovers that learning can feel like play.`,
        `A circle, square, and triangle become new friends who show ${name} how shapes appear everywhere in the world.`,
        `${name} follows a rainbow trail and learns how colors can turn every little moment into something magical.`,
        `Each new discovery helps ${name} feel curious, proud, and excited to keep exploring.`,
        `Soon the whole learning world celebrates ${name}'s bright ideas with music, dancing, and sparkling joy.`,
        `${name} heads home smiling, knowing that every day can bring a new happy thing to learn.`,
      ],
    },
    confidence: {
      title: (name) => `${name}'s Brave Little Hero Story`,
      arcs: (name) => [
        `${name} starts the day with a tiny flutter of nerves but a big brave heart ready to grow.`,
        `A kind helper reminds ${name} that courage often begins with one small step forward.`,
        `${name} faces a new challenge and discovers that trying matters even more than being perfect.`,
        `When a friend needs encouragement, ${name} offers kindness and becomes a hero in a gentle everyday way.`,
        `With each brave moment, ${name} feels confidence grow brighter and stronger inside.`,
        `${name} learns that listening, helping, and trying again are all special kinds of superpowers.`,
        `Soon the whole day feels lighter because ${name} has turned small worries into proud wins.`,
        `${name} ends the story standing tall, smiling wide, and knowing brave hearts can do amazing things.`,
      ],
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
  },

  ta: {
    adventure: {
      title: (name) => `${name}வின் அசாதாரண சாகசம்`,
      arcs: (name) => [
        `${name} விழித்து அட்டையில் மறைந்திருக்கும் பழைய வரைபடத்தை கண்டுபிடிக்கிறார்!`,
        `வரைபடத்தைப் பின்தொடர்ந்து, ${name} மர்மமான காட்டுக்குள் நுழைகிறார்.`,
        `${name} விவேகமான ஆந்தையுடன் நட்புக்கொள்கிறார் மற்றும் மறைந்த செல்வத்தின் ரகசியங்களைக் கற்றுக்கொள்கிறார்.`,
        `காட்டின் ஆழத்தில், ${name} சவால்களை எதிர்கொள்கிறார் ஆனால் ஒருபோதும் தைரியம் இழக்கவில்லை.`,
        `${name} மாயக் கற்களால் ஜொலிக்கும் ஒரு மறைந்த குகையைக் கண்டுபிடிக்கிறார்!`,
        `குகையின் உள்ளே, ${name} செல்வத்தின் பழைய காவலனைக் கண்டெதிர்கொள்கிறார்.`,
        `விரைவான சிந்தையுடன் மற்றும் தைரியத்துடன், ${name} காவலனின் புதிரைத் தீர்க்கிறார்.`,
        `செல்வங்கள் வெளிப்படுகின்றன - ஆனால் ${name} உண்மையான செல்வம் நட்பு என்று கண்டுபிடிக்கிறார்!`,
        `${name} பிறரான இழந்த பயணிகளை வீட்டிற்குத் திரும்பக் உதவுகிறார்.`,
        `வீரர்கள் வெற்றிகளுடன் வீட்டிற்குத் திரும்புகிறார்கள் தைரியம் மற்றும் கருணைக்கு!`
      ]
    },
    fantasy: {
      title: (name) => `${name} மாய அரசாட்சியில்`,
      arcs: (name) => [
        `${name} மாய அரசாட்சிக்கு வழிகாட்டும் ஒளிரும் வாயிலைக் கண்டுபிடிக்கிறார்!`,
        `ஸ்பார்க்கிள் என்னும் நட்பான வெள்ளைப்பாம்பு ${name}ஐ அரசாட்சির வாயிலில் வரவேற்கிறது.`,
        `${name} அரசாட்சியைப் பாதுகாக்கும் பழைய மாயத்தைப் பற்றி கற்றுக்கொள்கிறார்.`,
        `அரசாட்சியின் மாயம் மாயமாக மறைந்துகொண்டிருக்கிறது - சுத்தமான இதயம் மட்டுமே உதவ முடியும்!`,
        `${name} ஒளியின் படிகத்தை மீட்டெடுக்க ஒரு தேடலைத் தொடங்குகிறார்.`,
        `வழியில், ${name} வேதன், அரசிகள் மற்றும் பேசும் விலங்குகளுடன் நட்புக்கொள்கிறார்.`,
        `ஒன்றாக, அவர்கள் மாயச் சவால்களை மற்றும் புதிர்களை சந்திக்கிறார்கள்.`,
        `${name} அவரின் உள்ளான மாயம் நம்பியவற்றை விட வலிமையாக இருக்கிறது என்று கண்டுபிடிக்கிறார்!`,
        `நட்புக்கள் உதவியுடன், ${name} ஒளியின் படிகத்தை மீட்டெடுக்கிறார்.`,
        `அரசாட்சி ${name}ஐ மாயத்தின் உண்மையான வீரனாக கொண்டாடுகிறது!`
      ]
    }
  }
};

const themeAliases = {
  'animal-adventure': 'adventure',
  'dino-quest': 'adventure',
  'goodnight-garage': 'adventure',
  'unicorn-magic': 'fantasy',
  'alphabet-parade': 'learning',
  'number-train': 'learning',
  'shape-garden': 'learning',
  'color-rainbow': 'learning',
  'first-tooth-tale': 'milestone',
  'first-steps-cheer': 'milestone',
  'first-words-wonder': 'milestone',
  'milestone-magic': 'celebration',
  'brave-little-hero': 'confidence',
  'family-celebration': 'celebration',
  'birthday-bash': 'birthday',
  'festive-gathering': 'gathering',
  'heartfelt-tribute': 'tribute',
  customizable: 'adventure',
};

export function getTranslatedStory(language = 'en', theme = 'adventure', childName = 'Child') {
  const supportedLang = storyTranslations[language] || storyTranslations['en'];
  const aliasedTheme = themeAliases[theme] || theme;
  const themeContent =
    supportedLang[theme] ||
    supportedLang[aliasedTheme] ||
    storyTranslations.en[theme] ||
    storyTranslations.en[aliasedTheme] ||
    supportedLang['adventure'];
  
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
