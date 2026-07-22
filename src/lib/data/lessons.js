export const LESSON_LEVELS = [
  {
    id: 'foundations',
    name: 'Level 1: Coin Flip Foundations',
    badge: 'Beginner',
    tagline: 'Sample Spaces & Basic Ratios',
    description:
      'Discover how simple outcomes build the formula for all probability: P(Event) = Favorable / Total.',
    icon: '🪙',
    color: 'amber',
    questions: [
      {
        id: 'f1',
        type: 'coin',
        prompt: 'If you flip a fair coin, what is the probability of landing on Heads?',
        formulaLatex:
          'P(\\text{Heads}) = \\frac{\\text{Favorable Outcomes}}{\\text{Total Outcomes}}',
        totalOutcomes: 2,
        favorableOutcomes: 1,
        options: ['1/4', '1/2', '2/3', '1/1'],
        correctIndex: 1,
        explanation:
          'There is 1 favorable outcome (Heads) out of 2 equally likely total possibilities (Heads or Tails). So P(Heads) = 1/2 = 0.5 = 50%.'
      },
      {
        id: 'f2',
        type: 'coin_multi',
        prompt:
          'You flip 2 fair coins simultaneously. What is the probability of getting Heads on BOTH coins?',
        formulaLatex: 'P(\\text{Heads and Heads}) = \\frac{1}{2} \\times \\frac{1}{2}',
        totalOutcomes: 4,
        favorableOutcomes: 1,
        options: ['1/2', '1/4', '3/4', '1/8'],
        correctIndex: 1,
        explanation:
          'The total sample space is {HH, HT, TH, TT} (4 possibilities). Only 1 outcome (HH) has heads on both. So 1/4 = 25%.'
      }
    ]
  },
  {
    id: 'dice_marbles',
    name: 'Level 2: Dice & Bag of Marbles',
    badge: 'Intermediate',
    tagline: 'Disjoint Events & Combinations',
    description:
      'Learn how probabilities shift when drawing items without replacement or rolling multi-sided dice.',
    icon: '🎲',
    color: 'emerald',
    questions: [
      {
        id: 'm1',
        type: 'dice',
        prompt:
          'Rolling a standard 6-sided die, what is the probability of rolling an EVEN number (2, 4, or 6)?',
        formulaLatex: 'P(\\text{Even}) = \\frac{\\text{Count}(\\{2, 4, 6\\})}{\\text{Total Sides}}',
        totalOutcomes: 6,
        favorableOutcomes: 3,
        options: ['1/6', '1/3', '1/2', '2/3'],
        correctIndex: 2,
        explanation:
          'Out of {1, 2, 3, 4, 5, 6}, three numbers are even (2, 4, 6). 3/6 simplifies to 1/2.'
      },
      {
        id: 'm2',
        type: 'bag',
        prompt:
          'A bag has 3 Blue marbles and 2 Gold marbles (5 total). You draw 1 marble. What is P(Gold)?',
        formulaLatex: 'P(\\text{Gold}) = \\frac{2 \\text{ Gold Marbles}}{5 \\text{ Total Marbles}}',
        totalOutcomes: 5,
        favorableOutcomes: 2,
        options: ['2/5', '3/5', '1/5', '2/3'],
        correctIndex: 0,
        explanation: '2 out of the 5 marbles are Gold. Therefore P(Gold) = 2/5 = 40%.'
      }
    ]
  },
  {
    id: 'conditional',
    name: 'Level 3: Conditional & Bayes Thinking',
    badge: 'Advanced',
    tagline: 'Dependent Events P(A|B)',
    description: 'Master how new information alters likelihoods: calculating P(A|B) step by step.',
    icon: '⚡',
    color: 'cyan',
    questions: [
      {
        id: 'c1',
        type: 'bag_dependent',
        prompt:
          'A bag has 3 Blue & 2 Gold marbles. You draw 1 Gold marble and KEEP IT out. What is the probability that your SECOND marble is ALSO Gold?',
        formulaLatex:
          'P(\\text{Gold}_2 \\mid \\text{Gold}_1) = \\frac{1 \\text{ Gold remaining}}{4 \\text{ Total remaining}}',
        totalOutcomes: 4,
        favorableOutcomes: 1,
        options: ['2/5', '1/4', '2/4', '1/5'],
        correctIndex: 1,
        explanation:
          'After taking 1 Gold marble out, 1 Gold marble and 3 Blue marbles remain (4 total). The new probability is 1/4 = 25%!'
      }
    ]
  }
];
