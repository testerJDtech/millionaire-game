/**
 * QUESTIONS — THIS IS THE ONLY FILE YOU NEED TO EDIT TO CHANGE THE QUIZ
 * ─────────────────────────────────────────────────────────────────────
 *
 * Shape of one question:
 *
 *   {
 *     id: 'p1-q1',            // must be unique across the whole file
 *     value: 100,             // must match the prize ladder in settings.js
 *     question: 'Question text?',
 *     answers: { A: '...', B: '...', C: '...', D: '...' },
 *     correctAnswer: 'B'      // one of 'A' | 'B' | 'C' | 'D'
 *   }
 *
 * Rules the app checks at startup (errors appear on the host panel):
 *   • exactly 10 questions per pair
 *   • every question has all four answers A–D
 *   • correctAnswer is A, B, C or D
 *   • values run 100 → 1,000,000 in ladder order
 *   • no duplicate ids
 *
 * ── ABOUT THE SIX GROUPS ────────────────────────────────────────────
 * Your quiz sheet has six groups but the event is set up for four pairs.
 * Groups 1–4 are live below. Groups 5–6 are in `sparePairs` at the bottom.
 * To run six pairs: move them into the `teams` array and set
 * expectedTeamCount: 6 in settings.js. To swap one out, just cut and paste.
 */

export const teams = [
  // ───────────────────────────── PAIR 1 ─────────────────────────────
  {
    id: 'pair-1',
    name: 'The Millionaires',
    questions: [
      {
        id: 'p1-q1',
        value: 100,
        question: 'What is the capital city of France?',
        answers: { A: 'Madrid', B: 'Paris', C: 'Rome', D: 'Berlin' },
        correctAnswer: 'B',
      },
      {
        id: 'p1-q2',
        value: 500,
        question: 'How many days are there in a leap year?',
        answers: { A: '364', B: '365', C: '366', D: '367' },
        correctAnswer: 'C',
      },
      {
        id: 'p1-q3',
        value: 1000,
        question: 'Which planet is known as the Red Planet?',
        answers: { A: 'Venus', B: 'Mars', C: 'Jupiter', D: 'Mercury' },
        correctAnswer: 'B',
      },
      {
        id: 'p1-q4',
        value: 5000,
        question: 'Which animal is the largest mammal on Earth?',
        answers: { A: 'Elephant', B: 'Giraffe', C: 'Blue whale', D: 'Hippopotamus' },
        correctAnswer: 'C',
      },
      {
        id: 'p1-q5',
        value: 10000,
        question: 'Who wrote Romeo and Juliet?',
        answers: {
          A: 'Charles Dickens',
          B: 'William Shakespeare',
          C: 'Jane Austen',
          D: 'Oscar Wilde',
        },
        correctAnswer: 'B',
      },
      {
        id: 'p1-q6',
        value: 25000,
        question: 'Which country is famous for the ancient city of Machu Picchu?',
        answers: { A: 'Brazil', B: 'Mexico', C: 'Peru', D: 'Chile' },
        correctAnswer: 'C',
      },
      {
        id: 'p1-q7',
        value: 50000,
        question: 'What is the chemical symbol for gold?',
        answers: { A: 'Go', B: 'Gd', C: 'Au', D: 'Ag' },
        correctAnswer: 'C',
      },
      {
        id: 'p1-q8',
        value: 100000,
        question: 'Which Shakespeare play features the characters Viola and Malvolio?',
        answers: { A: 'Macbeth', B: 'Twelfth Night', C: 'Hamlet', D: 'King Lear' },
        correctAnswer: 'B',
      },
      {
        id: 'p1-q9',
        value: 500000,
        question: 'Which ocean is the deepest in the world?',
        answers: { A: 'Atlantic', B: 'Indian', C: 'Arctic', D: 'Pacific' },
        correctAnswer: 'D',
      },
      {
        id: 'p1-q10',
        value: 1000000,
        question: 'Which element has the atomic number 79?',
        answers: { A: 'Silver', B: 'Platinum', C: 'Gold', D: 'Copper' },
        correctAnswer: 'C',
      },
    ],
  },

  // ───────────────────────────── PAIR 2 ─────────────────────────────
  {
    id: 'pair-2',
    name: 'The Brainiacs',
    questions: [
      {
        id: 'p2-q1',
        value: 100,
        question: 'How many sides does a triangle have?',
        answers: { A: '2', B: '3', C: '4', D: '5' },
        correctAnswer: 'B',
      },
      {
        id: 'p2-q2',
        value: 500,
        question: 'Which fruit is traditionally associated with keeping the doctor away?',
        answers: { A: 'Orange', B: 'Banana', C: 'Apple', D: 'Pear' },
        correctAnswer: 'C',
      },
      {
        id: 'p2-q3',
        value: 1000,
        question: 'What is the largest continent?',
        answers: { A: 'Africa', B: 'Europe', C: 'Asia', D: 'North America' },
        correctAnswer: 'C',
      },
      {
        id: 'p2-q4',
        value: 5000,
        question: 'Which instrument has 88 keys?',
        answers: { A: 'Violin', B: 'Piano', C: 'Guitar', D: 'Flute' },
        correctAnswer: 'B',
      },
      {
        id: 'p2-q5',
        value: 10000,
        question: 'What is the currency of Japan?',
        answers: { A: 'Won', B: 'Yuan', C: 'Yen', D: 'Ringgit' },
        correctAnswer: 'C',
      },
      {
        id: 'p2-q6',
        value: 25000,
        question: 'Who painted the Mona Lisa?',
        answers: {
          A: 'Michelangelo',
          B: 'Leonardo da Vinci',
          C: 'Van Gogh',
          D: 'Raphael',
        },
        correctAnswer: 'B',
      },
      {
        id: 'p2-q7',
        value: 50000,
        question: 'Which organ pumps blood around the human body?',
        answers: { A: 'Brain', B: 'Liver', C: 'Heart', D: 'Kidney' },
        correctAnswer: 'C',
      },
      {
        id: 'p2-q8',
        value: 100000,
        question: 'Which country gifted the Statue of Liberty to the United States?',
        answers: { A: 'Spain', B: 'France', C: 'Italy', D: 'Germany' },
        correctAnswer: 'B',
      },
      {
        id: 'p2-q9',
        value: 500000,
        question: 'What is the smallest country in the world by area?',
        answers: { A: 'Monaco', B: 'Vatican City', C: 'Malta', D: 'Liechtenstein' },
        correctAnswer: 'B',
      },
      {
        id: 'p2-q10',
        value: 1000000,
        question: 'Which ancient civilisation built Machu Picchu?',
        answers: { A: 'Maya', B: 'Aztec', C: 'Inca', D: 'Roman' },
        correctAnswer: 'C',
      },
    ],
  },

  // ───────────────────────────── PAIR 3 ─────────────────────────────
  {
    id: 'pair-3',
    name: 'The Know-It-Alls',
    questions: [
      {
        id: 'p3-q1',
        value: 100,
        question: 'What colour do you get when you mix red and white?',
        answers: { A: 'Purple', B: 'Pink', C: 'Orange', D: 'Brown' },
        correctAnswer: 'B',
      },
      {
        id: 'p3-q2',
        value: 500,
        question: 'How many letters are there in the English alphabet?',
        answers: { A: '24', B: '25', C: '26', D: '27' },
        correctAnswer: 'C',
      },
      {
        id: 'p3-q3',
        value: 1000,
        question: 'Which country is famous for the Eiffel Tower?',
        answers: { A: 'Italy', B: 'France', C: 'Belgium', D: 'Switzerland' },
        correctAnswer: 'B',
      },
      {
        id: 'p3-q4',
        value: 5000,
        question: 'What is the fastest land animal?',
        answers: { A: 'Lion', B: 'Horse', C: 'Cheetah', D: 'Leopard' },
        correctAnswer: 'C',
      },
      {
        id: 'p3-q5',
        value: 10000,
        question: 'Which blood type is commonly known as the universal donor?',
        answers: { A: 'AB+', B: 'O−', C: 'A+', D: 'B−' },
        correctAnswer: 'B',
      },
      {
        id: 'p3-q6',
        value: 25000,
        question: 'Which British author created Sherlock Holmes?',
        answers: {
          A: 'Agatha Christie',
          B: 'J.R.R. Tolkien',
          C: 'Arthur Conan Doyle',
          D: 'C.S. Lewis',
        },
        correctAnswer: 'C',
      },
      {
        id: 'p3-q7',
        value: 50000,
        question: 'Which country has the largest population in Africa?',
        answers: { A: 'Egypt', B: 'South Africa', C: 'Kenya', D: 'Nigeria' },
        correctAnswer: 'D',
      },
      {
        id: 'p3-q8',
        value: 100000,
        question: 'What is the hardest natural substance on Earth?',
        answers: { A: 'Quartz', B: 'Diamond', C: 'Granite', D: 'Steel' },
        correctAnswer: 'B',
      },
      {
        id: 'p3-q9',
        value: 500000,
        question: 'Which planet has the most prominent ring system?',
        answers: { A: 'Jupiter', B: 'Uranus', C: 'Saturn', D: 'Neptune' },
        correctAnswer: 'C',
      },
      {
        id: 'p3-q10',
        value: 1000000,
        question: 'What is the longest river in South America?',
        answers: { A: 'Paraná', B: 'Amazon', C: 'Orinoco', D: 'São Francisco' },
        correctAnswer: 'B',
      },
    ],
  },

  // ───────────────────────────── PAIR 4 ─────────────────────────────
  {
    id: 'pair-4',
    name: 'The Risk Takers',
    questions: [
      {
        id: 'p4-q1',
        value: 100,
        question: 'Which Disney character is a wooden puppet who wants to become a real boy?',
        answers: { A: 'Aladdin', B: 'Pinocchio', C: 'Peter Pan', D: 'Dumbo' },
        correctAnswer: 'B',
      },
      {
        id: 'p4-q2',
        value: 500,
        question:
          'How many players are on the pitch for one football team at the start of a match?',
        answers: { A: '9', B: '10', C: '11', D: '12' },
        correctAnswer: 'C',
      },
      {
        id: 'p4-q3',
        value: 1000,
        question: 'Which is the largest planet in our Solar System?',
        answers: { A: 'Earth', B: 'Saturn', C: 'Neptune', D: 'Jupiter' },
        correctAnswer: 'D',
      },
      {
        id: 'p4-q4',
        value: 5000,
        question: 'Which country is shaped like a boot?',
        answers: { A: 'Greece', B: 'Italy', C: 'Portugal', D: 'Spain' },
        correctAnswer: 'B',
      },
      {
        id: 'p4-q5',
        value: 10000,
        question: 'What is the main language spoken in Brazil?',
        answers: { A: 'Spanish', B: 'Portuguese', C: 'French', D: 'Italian' },
        correctAnswer: 'B',
      },
      {
        id: 'p4-q6',
        value: 25000,
        question: 'Who was the first person to walk on the Moon?',
        answers: {
          A: 'Buzz Aldrin',
          B: 'Yuri Gagarin',
          C: 'Neil Armstrong',
          D: 'Michael Collins',
        },
        correctAnswer: 'C',
      },
      {
        id: 'p4-q7',
        value: 50000,
        question: 'Which is the longest bone in the human body?',
        answers: { A: 'Tibia', B: 'Femur', C: 'Humerus', D: 'Radius' },
        correctAnswer: 'B',
      },
      {
        id: 'p4-q8',
        value: 100000,
        question: 'Which novel begins with the famous line “Call me Ishmael”?',
        answers: {
          A: 'Moby-Dick',
          B: 'The Great Gatsby',
          C: 'Dracula',
          D: 'Oliver Twist',
        },
        correctAnswer: 'A',
      },
      {
        id: 'p4-q9',
        value: 500000,
        question: 'Which scientist developed the theory of general relativity?',
        answers: {
          A: 'Isaac Newton',
          B: 'Albert Einstein',
          C: 'Galileo Galilei',
          D: 'Stephen Hawking',
        },
        correctAnswer: 'B',
      },
      {
        id: 'p4-q10',
        value: 1000000,
        question:
          'Which country has the most time zones when its overseas territories are included?',
        answers: { A: 'Russia', B: 'United States', C: 'France', D: 'Australia' },
        correctAnswer: 'C',
      },
    ],
  },
];

/**
 * SPARE PAIRS — Groups 5 and 6 from your quiz sheet.
 * Not used by the game as it stands. To use one, cut the whole object and
 * paste it into the `teams` array above (and update expectedTeamCount).
 */
export const sparePairs = [
  {
    id: 'pair-5',
    name: 'The Scholars',
    questions: [
      {
        id: 'p5-q1',
        value: 100,
        question: 'What is the opposite of “ancient”?',
        answers: { A: 'Old', B: 'Historic', C: 'Modern', D: 'Past' },
        correctAnswer: 'C',
      },
      {
        id: 'p5-q2',
        value: 500,
        question: 'Which animal is known as “man’s best friend”?',
        answers: { A: 'Cat', B: 'Horse', C: 'Dog', D: 'Rabbit' },
        correctAnswer: 'C',
      },
      {
        id: 'p5-q3',
        value: 1000,
        question: 'Which month comes after September?',
        answers: { A: 'August', B: 'October', C: 'November', D: 'December' },
        correctAnswer: 'B',
      },
      {
        id: 'p5-q4',
        value: 5000,
        question: 'Which gas do humans need to breathe to survive?',
        answers: { A: 'Carbon dioxide', B: 'Oxygen', C: 'Hydrogen', D: 'Helium' },
        correctAnswer: 'B',
      },
      {
        id: 'p5-q5',
        value: 10000,
        question: 'Who wrote Pride and Prejudice?',
        answers: {
          A: 'Jane Austen',
          B: 'Emily Brontë',
          C: 'Virginia Woolf',
          D: 'Mary Shelley',
        },
        correctAnswer: 'A',
      },
      {
        id: 'p5-q6',
        value: 25000,
        question: 'Which African country is home to the ancient pyramids of Giza?',
        answers: { A: 'Sudan', B: 'Egypt', C: 'Morocco', D: 'Ethiopia' },
        correctAnswer: 'B',
      },
      {
        id: 'p5-q7',
        value: 50000,
        question: 'What is the capital of Canada?',
        answers: { A: 'Toronto', B: 'Vancouver', C: 'Montreal', D: 'Ottawa' },
        correctAnswer: 'D',
      },
      {
        id: 'p5-q8',
        value: 100000,
        question:
          'Which composer became deaf later in life but continued composing music?',
        answers: { A: 'Mozart', B: 'Beethoven', C: 'Bach', D: 'Chopin' },
        correctAnswer: 'B',
      },
      {
        id: 'p5-q9',
        value: 500000,
        question: 'Which Greek god was known as the god of the sea?',
        answers: { A: 'Zeus', B: 'Apollo', C: 'Poseidon', D: 'Hermes' },
        correctAnswer: 'C',
      },
      {
        id: 'p5-q10',
        value: 1000000,
        question:
          'Which mathematician is credited with the famous theorem about right-angled triangles?',
        answers: { A: 'Pythagoras', B: 'Euclid', C: 'Archimedes', D: 'Aristotle' },
        correctAnswer: 'A',
      },
    ],
  },
  {
    id: 'pair-6',
    name: 'The Final Bosses',
    questions: [
      {
        id: 'p6-q1',
        value: 100,
        question: 'What colour is a typical school bus in the United States?',
        answers: { A: 'Blue', B: 'Yellow', C: 'Green', D: 'Red' },
        correctAnswer: 'B',
      },
      {
        id: 'p6-q2',
        value: 500,
        question: 'How many wheels does a standard bicycle have?',
        answers: { A: '1', B: '2', C: '3', D: '4' },
        correctAnswer: 'B',
      },
      {
        id: 'p6-q3',
        value: 1000,
        question: 'Which ocean lies between Africa and Australia?',
        answers: { A: 'Atlantic', B: 'Pacific', C: 'Indian', D: 'Arctic' },
        correctAnswer: 'C',
      },
      {
        id: 'p6-q4',
        value: 5000,
        question: 'Which superhero is also known as Bruce Wayne?',
        answers: { A: 'Superman', B: 'Iron Man', C: 'Batman', D: 'Spider-Man' },
        correctAnswer: 'C',
      },
      {
        id: 'p6-q5',
        value: 10000,
        question: 'Which country is home to the city of Barcelona?',
        answers: { A: 'Portugal', B: 'Spain', C: 'France', D: 'Italy' },
        correctAnswer: 'B',
      },
      {
        id: 'p6-q6',
        value: 25000,
        question: 'What is the largest organ of the human body?',
        answers: { A: 'Liver', B: 'Brain', C: 'Skin', D: 'Lungs' },
        correctAnswer: 'C',
      },
      {
        id: 'p6-q7',
        value: 50000,
        question: 'Which playwright wrote A Midsummer Night’s Dream?',
        answers: {
          A: 'William Shakespeare',
          B: 'Oscar Wilde',
          C: 'George Bernard Shaw',
          D: 'Christopher Marlowe',
        },
        correctAnswer: 'A',
      },
      {
        id: 'p6-q8',
        value: 100000,
        question: 'Which country was formerly known as Persia?',
        answers: { A: 'Iraq', B: 'Iran', C: 'Turkey', D: 'Syria' },
        correctAnswer: 'B',
      },
      {
        id: 'p6-q9',
        value: 500000,
        question: 'Which particle has a negative electrical charge?',
        answers: { A: 'Proton', B: 'Neutron', C: 'Electron', D: 'Nucleus' },
        correctAnswer: 'C',
      },
      {
        id: 'p6-q10',
        value: 1000000,
        question:
          'Which empire was ruled by Mansa Musa, one of history’s wealthiest rulers?',
        answers: {
          A: 'Roman Empire',
          B: 'Mali Empire',
          C: 'Ottoman Empire',
          D: 'Byzantine Empire',
        },
        correctAnswer: 'B',
      },
    ],
  },
];

export default teams;
