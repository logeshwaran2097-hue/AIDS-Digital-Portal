// ============================================================================
// ANNA UNIVERSITY R-2021 EXAM FORMAT — 100% AUTHENTIC 5-UNIT QUESTION BANK
// Part A: 2 Marks (10 Questions × 2 = 20 Marks — Short Technical Answers)
// Part B: 8 Marks (5 Questions × 8 = 40 Marks — Descriptive with Proofs/Pseudocode)
// Part C: 16 Marks (3 Questions × 16 = 48 Marks — Comprehensive Analytical/Essay)
// Complete 5-Unit Coverage for AL3391 (AI), AD3351 (DAA), AD3501 (Deep Learning)
// ============================================================================

export interface PartAQuestion { q: string; a: string }
export interface PartBQuestion { q: string; a: string }
export interface PartCQuestion { q: string; a: string }
export interface RevisionNote { title: string; points: string[] }
export interface QuizQuestion { q: string; options: string[]; answerIndex: number; explanation: string }

export interface UnitData {
  unitNo: number
  title: string
  topics: string[]
  partA: PartAQuestion[]
  partB: PartBQuestion[]
  partC: PartCQuestion[]
  notes: RevisionNote[]
  quiz: QuizQuestion[]
}

export interface SubjectUnitData {
  code: string
  name: string
  units: UnitData[]
}

export const STUDY_DATABASE: SubjectUnitData[] = [
  // ==========================================================================
  // SUBJECT 1: AL3391 — ARTIFICIAL INTELLIGENCE (UNITS 1 - 5)
  // ==========================================================================
  {
    code: 'AL3391',
    name: 'Artificial Intelligence',
    units: [
      // --- UNIT 1 ---
      {
        unitNo: 1,
        title: 'Problem Solving & State Space Search',
        topics: ['Intelligent Agents', 'PEAS Description', 'Agent Types', 'State Space Representation', 'BFS', 'DFS', 'Iterative Deepening', 'Heuristic Search', 'A* Algorithm', 'Hill Climbing'],
        partA: [
          {
            q: 'Define Rational Agent in Artificial Intelligence.',
            a: 'A rational agent is an autonomous entity that perceives its environment through sensors, acts upon that environment through actuators, and always selects an action that maximizes its expected performance measure based on its percept sequence and built-in knowledge.'
          },
          {
            q: 'What is an admissible heuristic in A* search?',
            a: 'A heuristic function h(n) is admissible if it never overestimates the actual cost to reach the goal state from node n. Formally, h(n) ≤ h*(n) for all nodes n, where h*(n) is the true optimal cost from n to the nearest goal.'
          },
          {
            q: 'Distinguish between BFS and DFS in terms of completeness.',
            a: 'BFS is always complete for finite branching factors — it will find a solution if one exists. DFS is not complete in infinite-depth trees or graphs with cycles unless depth-limited. BFS uses O(b^d) space; DFS uses O(b·m) space where m is maximum depth.'
          },
          {
            q: 'State the PEAS description for an autonomous vacuum cleaner agent.',
            a: 'Performance: Cleanliness, efficiency, battery conservation. Environment: Room with dirt, obstacles, walls. Actuators: Wheels, suction motor, brush. Sensors: Dirt sensor, bump sensor, infrared proximity sensor, camera.'
          },
          {
            q: 'What is the difference between informed and uninformed search?',
            a: 'Uninformed (blind) search strategies like BFS and DFS use no domain-specific knowledge — they explore systematically. Informed search strategies like A* and Greedy Best-First use heuristic functions h(n) that estimate cost to goal, enabling more efficient path finding.'
          },
          {
            q: 'Define state space in the context of problem solving.',
            a: 'State space is the set of all possible states reachable from the initial state by any sequence of actions. It is represented as a graph where nodes are states and edges are actions/operators that transition between states.'
          },
          {
            q: 'What is Hill Climbing? State its limitations.',
            a: 'Hill Climbing is a local search algorithm that continuously moves toward the direction of increasing value (uphill) to find the peak. Its main limitations are: (1) Local maxima — gets stuck at peaks lower than global maximum, (2) Plateaus — flat regions with no uphill moves, (3) Ridges — narrow elevations difficult to traverse.'
          },
        ],
        partB: [
          {
            q: 'Explain the A* search algorithm in detail. Prove that A* with tree search is optimal if h(n) is admissible.',
            a: '**A* Search Algorithm:**\nEvaluation function: f(n) = g(n) + h(n)\n- g(n): exact path cost from initial state to current node n\n- h(n): estimated cost from node n to goal (heuristic)\n\n**Pseudocode:**\n```\nA*(initial_state, goal_test, successors, h):\n  OPEN = priority queue ordered by f(n)\n  CLOSED = empty set\n  insert (initial_node, f = 0 + h(initial)) into OPEN\n  while OPEN is not empty:\n    current = pop node with lowest f from OPEN\n    if goal_test(current): return solution_path(current)\n    add current to CLOSED\n    for each child in successors(current):\n      if child in CLOSED: continue\n      g_tentative = g(current) + step_cost(current, child)\n      if child not in OPEN or g_tentative < g(child):\n        g(child) = g_tentative\n        f(child) = g(child) + h(child)\n        insert/update child in OPEN\n  return FAILURE\n```\n\n**Proof of Optimality (Tree Search):**\nLet G₂ be a suboptimal goal in OPEN, so g(G₂) > C* (where C* is optimal cost).\nSince G₂ is a goal, h(G₂) = 0, hence f(G₂) = g(G₂) > C*.\nLet n be an unexpanded node on the optimal path to G*.\nf(n) = g(n) + h(n) ≤ C* (by admissibility of h).\nTherefore, f(n) ≤ C* < f(G₂).\nA* will expand n before G₂. Thus, G₂ will never be selected before the optimal goal G*.'
          },
          {
            q: 'Explain the four fundamental agent types with neat architectural block diagrams.',
            a: '**1. Simple Reflex Agent:**\nSelects actions based only on current percept, ignoring history. Uses condition-action rules: `if dirty then suck`.\n\n**2. Model-Based Reflex Agent:**\nMaintains internal state reflecting unobserved aspects of environment. Updates internal state based on percept history and transition models.\n\n**3. Goal-Based Agent:**\nCombines goal descriptions with environment model to evaluate which actions achieve the desired objective. Uses search and planning.\n\n**4. Utility-Based Agent:**\nUses a utility function to map states to real numbers (degrees of happiness/preference). Chooses actions that maximize expected utility in uncertain environments.\n\n**Learning Agent Architecture:**\nConsists of 4 components: (1) Learning element (makes improvements), (2) Critic (evaluates performance against standard), (3) Learning goals (feedback), (4) Performance element (selects actions).'
          },
        ],
        partC: [
          {
            q: 'Discuss heuristic search techniques. Compare BFS, DFS, Iterative Deepening (IDS), and A* on completeness, time complexity, and space complexity.',
            a: '**Comparative Analysis of Search Strategies:**\n\n| Strategy | Complete? | Time Complexity | Space Complexity | Optimal? |\n|---|---|---|---|---|\n| BFS | Yes (if b finite) | O(b^d) | O(b^d) | Yes (unit cost) |\n| DFS | No (cycles/infinite) | O(b^m) | O(b·m) | No |\n| Depth-Limited (DLS) | Yes (if l ≥ d) | O(b^l) | O(b·l) | No |\n| Iterative Deepening (IDS) | Yes (if b finite) | O(b^d) | O(b·d) | Yes (unit cost) |\n| Greedy Best-First | No (cycles) | O(b^m) | O(b^m) | No |\n| A* Search | Yes (finite b) | O(b^d) | O(b^d) | Yes (admissible h) |\n\n*Where: b = branching factor, d = shallowest goal depth, m = maximum depth of search tree.*\n\n**IDS Advantage:** Combines space efficiency of DFS (linear space O(bd)) with completeness and optimality of BFS. The redundant generation of top levels is mathematically negligible: ratio of work is (b+1)/(b-1), ~1.5 for b=10.'
          },
        ],
        notes: [
          {
            title: 'Search Complexity Cheat Sheet',
            points: [
              'BFS: Time O(b^d), Space O(b^d) — space is the bottleneck',
              'DFS: Time O(b^m), Space O(bm) — linear space',
              'IDS: Time O(b^d), Space O(bd) — optimal for uninformed search',
              'A*: Time & Space O(b^d) — optimal when h(n) is admissible and consistent',
            ]
          },
        ],
        quiz: [
          {
            q: 'A heuristic function h(n) is said to be admissible if:',
            options: ['h(n) >= h*(n)', 'h(n) <= h*(n)', 'h(n) = 0 for all n', 'h(n) is strictly negative'],
            answerIndex: 1,
            explanation: 'Admissible means h(n) never overestimates the actual minimal cost h*(n) to reach the goal.'
          },
        ],
      },

      // --- UNIT 2 ---
      {
        unitNo: 2,
        title: 'Game Playing & Constraint Satisfaction Problems',
        topics: ['Minimax Algorithm', 'Alpha-Beta Pruning', 'Evaluation Functions', 'Constraint Satisfaction Problems (CSP)', 'Backtracking Search', 'Forward Checking', 'Arc Consistency (AC-3)'],
        partA: [
          {
            q: 'Define the Minimax value of a game state.',
            a: 'MINIMAX(s) = UTILITY(s) if s is terminal; max(MINIMAX(s\')) if MAX\'s turn; min(MINIMAX(s\')) if MIN\'s turn. It represents the optimal payoff achievable assuming both players play rationally.'
          },
          {
            q: 'What is Alpha-Beta Pruning? State the conditions for pruning.',
            a: 'Alpha-Beta pruning is an adversarial search optimization that eliminates subtrees that cannot influence the final decision. Alpha (α): best value MAX can guarantee. Beta (β): best value MIN can guarantee. Pruning condition: Prune when α ≥ β.'
          },
          {
            q: 'Define Constraint Satisfaction Problem (CSP).',
            a: 'A CSP is defined by a triplet (X, D, C): X = set of variables {X₁,...,Xₙ}, D = domain of values {D₁,...,Dₙ}, and C = set of constraints {C₁,...,Cₘ} specifying allowable value combinations.'
          },
          {
            q: 'What is the Minimum Remaining Values (MRV) heuristic?',
            a: 'MRV (also called "most constrained variable" or "fail-first" heuristic) selects the variable with the fewest remaining legal values in its domain to instantiate next, detecting failure early.'
          },
          {
            q: 'Explain the concept of Arc Consistency (AC-3).',
            a: 'A variable Xᵢ is arc-consistent with Xⱼ if for every value x in D(Xᵢ), there is some value y in D(Xⱼ) that satisfies the binary constraint on (Xᵢ, Xⱼ). AC-3 maintains a queue of arcs and systematically removes inconsistent domain values in O(cd³) time.'
          },
        ],
        partB: [
          {
            q: 'Explain the Minimax algorithm and Alpha-Beta Pruning with an example game tree. Show which branches are pruned.',
            a: '**Alpha-Beta Pruning Trace:**\n- Alpha (α) initialized to -∞\n- Beta (β) initialized to +∞\n\n**Rules:**\n- At MAX node: α = max(α, v). If v ≥ β, prune remaining children.\n- At MIN node: β = min(β, v). If v ≤ α, prune remaining children.\n\n**Complexity:**\n- Standard Minimax: O(b^m)\n- Alpha-Beta with optimal move ordering: O(b^(m/2)) — effectively doubles the search depth achievable within the same time limit!'
          },
          {
            q: 'Explain Constraint Propagation in CSPs using the AC-3 algorithm with complete pseudocode.',
            a: '**AC-3 Algorithm Pseudocode:**\n```\nfunction AC-3(csp) returns false if an inconsistency is found and true otherwise\n  queue = all binary arcs in csp\n  while queue is not empty:\n    (Xi, Xj) = remove-first(queue)\n    if REVISE(csp, Xi, Xj):\n      if size of Di == 0: return false\n      for each Xk in NEIGHBORS[Xi] - {Xj}:\n        add (Xk, Xi) to queue\n  return true\n\nfunction REVISE(csp, Xi, Xj) returns true iff we revise the domain of Xi\n  revised = false\n  for each x in Di:\n    if no value y in Dj allows (x, y) to satisfy constraint between Xi and Xj:\n      delete x from Di\n      revised = true\n  return revised\n```'
          },
        ],
        partC: [
          {
            q: 'Formulate the Map Coloring problem (Australia map) and 8-Queens problem as CSPs. Solve the 8-Queens problem using Backtracking Search with Forward Checking.',
            a: '**1. Australia Map Coloring as CSP:**\n- Variables: {WA, NT, Q, NSW, V, SA, T}\n- Domains: {red, green, blue} for each variable\n- Constraints: Adjacent states must have different colors:\n  WA ≠ NT, WA ≠ SA, NT ≠ SA, NT ≠ Q, SA ≠ Q, SA ≠ NSW, SA ≠ V, Q ≠ NSW, NSW ≠ V\n\n**2. 8-Queens Problem:**\n- Variables: Q₁, Q₂, ..., Q₈ (representing column of each queen in row i)\n- Domains: {1, 2, 3, 4, 5, 6, 7, 8}\n- Constraints: No two queens on same column or diagonal:\n  Qᵢ ≠ Qⱼ and |Qᵢ - Qⱼ| ≠ |i - j| for all i ≠ j\n\n**Forward Checking:** Whenever variable X is assigned value x, eliminate inconsistent values from domains of unassigned variables connected to X by constraints. If any domain becomes empty, backtrack immediately.'
          },
        ],
        notes: [
          {
            title: 'Game & CSP Quick Principles',
            points: [
              'Minimax: Optimal play for deterministic, zero-sum, perfect-information 2-player games',
              'Alpha-Beta: O(b^(m/2)) with perfect ordering; α is MAX lower bound, β is MIN upper bound',
              'MRV selects variable with fewest legal choices ("fail-first")',
              'Degree heuristic breaks ties by choosing variable with most constraints on unassigned variables',
            ]
          },
        ],
        quiz: [
          {
            q: 'In Alpha-Beta pruning, a branch is pruned when:',
            options: ['α < β', 'α ≥ β', 'α = 0', 'β = 0'],
            answerIndex: 1,
            explanation: 'When α ≥ β, the current state cannot yield a better payoff than already guaranteed elsewhere, so remaining subtrees are safely pruned.'
          },
        ],
      },

      // --- UNIT 3 ---
      {
        unitNo: 3,
        title: 'Knowledge Representation & First-Order Logic',
        topics: ['Propositional Logic', 'Inference Rules', 'First-Order Logic (FOL)', 'Syntax & Semantics of FOL', 'Unification', 'Forward Chaining', 'Backward Chaining', 'Resolution Refutation'],
        partA: [
          {
            q: 'Differentiate between Propositional Logic and First-Order Logic.',
            a: 'Propositional logic represents facts about the world that are either true or false (atomic propositions). First-Order Logic (FOL) represents objects, relations, and functions, allowing quantifiers (∀, ∃) and expressive predicate assertions like ∀x (Student(x) → Intelligent(x)).'
          },
          {
            q: 'Define Unification in First-Order Logic.',
            a: 'Unification is the algorithmic process of finding a substitution θ (mapping variables to terms) that makes two different logical expressions syntactically identical. UNIFY(Knows(John, x), Knows(John, Jane)) returns θ = {x/Jane}.'
          },
          {
            q: 'What is Modus Ponens? State the inference rule.',
            a: 'Modus Ponens is a fundamental valid inference rule: If α → β is true, and α is true, then β can be inferred as true. Formally: (α → β, α) ⊢ β.'
          },
          {
            q: 'What is Conjunctive Normal Form (CNF)?',
            a: 'CNF is a standard form of logical representation where a formula is expressed as a conjunction (AND, ∧) of clauses, where each clause is a disjunction (OR, ∨) of literals. Every FOL formula can be converted to CNF via Skolemization and quantifier elimination.'
          },
          {
            q: 'Differentiate Forward Chaining and Backward Chaining.',
            a: 'Forward chaining is data-driven: starts with known facts and applies rules to infer new facts until the goal is reached. Backward chaining is goal-driven: starts with the goal query and searches for rules that conclude it, recursively proving premises.'
          },
        ],
        partB: [
          {
            q: 'Explain the Resolution Refutation procedure in First-Order Logic with step-by-step conversion to CNF.',
            a: '**Resolution Refutation Procedure:**\n1. Negate the goal/query to be proved: ¬Goal\n2. Convert all knowledge base axioms and ¬Goal into Conjunctive Normal Form (CNF)\n3. Repeatedly select two clauses that contain complementary literals\n4. Apply unification and resolve them to produce a resolvent\n5. If the empty clause (contradiction, □) is derived, the original goal is proven TRUE by contradiction.\n\n**Steps to Convert to CNF:**\n1. Eliminate implications: P → Q becomes ¬P ∨ Q\n2. Move negations inward using De Morgan\'s laws: ¬(P ∧ Q) ≡ ¬P ∨ ¬Q\n3. Standardize variables (rename apart)\n4. Skolemization: Replace existential quantifiers with Skolem constants/functions\n5. Drop universal quantifiers\n6. Distribute ∨ over ∧'
          },
          {
            q: 'Explain Forward Chaining algorithm for definite clauses with pseudocode and trace an example.',
            a: '**Forward Chaining Algorithm:**\nDefinite clauses have exactly one positive literal: (p₁ ∧ p₂ ∧ ... ∧ pₙ) → q.\n\n**Pseudocode:**\n```\nFOL-FC-ASK(KB, alpha):\n  repeat until new facts are generated:\n    for each rule in KB:\n      (p1 ∧ ... ∧ pk → q)\n      for each substitution theta such that theta unifies p1..pk with facts in KB:\n        q_prime = SUBST(theta, q)\n        if q_prime not in KB:\n          add q_prime to KB\n          phi = UNIFY(q_prime, alpha)\n          if phi is not fail: return phi\n  return false\n```'
          },
        ],
        partC: [
          {
            q: 'Consider the following statements:\n(i) Marcus was a man.\n(ii) Marcus was a Pompeian.\n(iii) All Pompeians were Romans.\n(iv) Caesar was a ruler.\n(v) All Romans were either loyal to Caesar or hated him.\n(vi) Everyone is loyal to someone.\n(vii) People only try to assassinate rulers they are not loyal to.\n(viii) Marcus tried to assassinate Caesar.\nTranslate into FOL and prove "Marcus hated Caesar" using Resolution.',
            a: '**FOL Formalization:**\n1. Man(Marcus)\n2. Pompeian(Marcus)\n3. ∀x (Pompeian(x) → Roman(x))\n4. Ruler(Caesar)\n5. ∀x (Roman(x) → LoyalTo(x, Caesar) ∨ Hate(x, Caesar))\n6. ∀x ∃y LoyalTo(x, y)\n7. ∀x ∀y (Person(x) ∧ Ruler(y) ∧ TryAssassinate(x, y) → ¬LoyalTo(x, y))\n8. TryAssassinate(Marcus, Caesar)\n\n**Goal:** Hate(Marcus, Caesar)\n**Negated Goal:** ¬Hate(Marcus, Caesar)\n\n**CNF Clauses:**\nC1: Pompeian(Marcus)\nC2: ¬Pompeian(x) ∨ Roman(x)\nC3: ¬Roman(y) ∨ LoyalTo(y, Caesar) ∨ Hate(y, Caesar)\nC4: ¬TryAssassinate(z, w) ∨ ¬Ruler(w) ∨ ¬LoyalTo(z, w)\nC5: Ruler(Caesar)\nC6: TryAssassinate(Marcus, Caesar)\nC7: ¬Hate(Marcus, Caesar)\n\n**Resolution Steps:**\n- Resolve C1 & C2 {x/Marcus} → Roman(Marcus) [C8]\n- Resolve C8 & C3 {y/Marcus} → LoyalTo(Marcus, Caesar) ∨ Hate(Marcus, Caesar) [C9]\n- Resolve C9 & C7 → LoyalTo(Marcus, Caesar) [C10]\n- Resolve C4 & C6 {z/Marcus, w/Caesar} → ¬Ruler(Caesar) ∨ ¬LoyalTo(Marcus, Caesar) [C11]\n- Resolve C11 & C5 → ¬LoyalTo(Marcus, Caesar) [C12]\n- Resolve C10 & C12 → Empty Clause (□, Contradiction!)\n**Conclusion:** Therefore, "Marcus hated Caesar" is proven TRUE.'
          },
        ],
        notes: [
          {
            title: 'FOL Resolution Highlights',
            points: [
              'Skolemization replaces ∃x with Skolem constants c or Skolem functions f(y)',
              'Resolution is sound and refutation-complete for First-Order Logic',
              'Forward chaining is sound and complete for definite clauses in polynomial time',
            ]
          },
        ],
        quiz: [
          {
            q: 'Which algorithm is guaranteed to derive the empty clause if a set of FOL clauses is unsatisfiable?',
            options: ['Backtracking', 'Resolution Refutation', 'Hill Climbing', 'A* Search'],
            answerIndex: 1,
            explanation: 'Resolution refutation is sound and refutation-complete for first-order logic sentences.'
          },
        ],
      },

      // --- UNIT 4 ---
      {
        unitNo: 4,
        title: 'Planning & Probabilistic Reasoning',
        topics: ['Classical Planning', 'STRIPS & PDDL', 'Planning as State-Space Search', 'Uncertainty & Probability', 'Bayes Rule', 'Bayesian Networks', 'Exact Inference by Enumeration', 'Variable Elimination'],
        partA: [
          {
            q: 'What are the three components of a STRIPS action representation?',
            a: 'A STRIPS action consists of: (1) Action Name and parameter list, (2) Preconditions (conjunction of positive literals required to execute the action), and (3) Effects (Delete list: literals removed, and Add list: literals made true by the action).'
          },
          {
            q: 'State Bayes\' Theorem with formula and identify each term.',
            a: 'P(A|B) = [P(B|A) · P(A)] / P(B). Where P(A|B) is posterior probability, P(B|A) is likelihood, P(A) is prior probability, and P(B) is the marginal evidence normalizing constant.'
          },
          {
            q: 'Define Conditional Independence in probability theory.',
            a: 'Two variables X and Y are conditionally independent given Z if P(X, Y | Z) = P(X | Z) · P(Y | Z), or equivalently P(X | Y, Z) = P(X | Z).'
          },
          {
            q: 'What is a Bayesian Belief Network (BBN)?',
            a: 'A Bayesian Network is a Directed Acyclic Graph (DAG) where nodes represent random variables and directed edges represent direct conditional dependencies. Each node is associated with a Conditional Probability Table (CPT).'
          },
          {
            q: 'Differentiate progression planning and regression planning.',
            a: 'Progression planning (forward state-space search) starts at the initial state and applies valid operators to reach a goal state. Regression planning (backward search) starts at the goal description and searches backward for actions whose preconditions can be satisfied.'
          },
        ],
        partB: [
          {
            q: 'Explain the representation of actions and state transitions in PDDL with an air cargo transport or blocks world planning problem.',
            a: '**Blocks World PDDL Representation:**\n- Predicates: `On(b, c)`, `OnTable(b)`, `Clear(b)`, `Holding(b)`, `ArmEmpty`\n\n**Action Stack(x, y):**\n- Precondition: `Holding(x) ∧ Clear(y)`\n- Effect: `On(x, y) ∧ Clear(x) ∧ ArmEmpty ∧ ¬Holding(x) ∧ ¬Clear(y)`\n\n**Action Unstack(x, y):**\n- Precondition: `On(x, y) ∧ Clear(x) ∧ ArmEmpty`\n- Effect: `Holding(x) ∧ Clear(y) ∧ ¬On(x, y) ∧ ¬Clear(x) ∧ ¬ArmEmpty`\n\n**Action Pickup(x):**\n- Precondition: `Clear(x) ∧ OnTable(x) ∧ ArmEmpty`\n- Effect: `Holding(x) ∧ ¬OnTable(x) ∧ ¬Clear(x) ∧ ¬ArmEmpty`\n\n**Action Putdown(x):**\n- Precondition: `Holding(x)`\n- Effect: `OnTable(x) ∧ Clear(x) ∧ ArmEmpty ∧ ¬Holding(x)`'
          },
          {
            q: 'Explain Bayesian Network construction and inference by enumeration with an example.',
            a: '**Bayesian Network Joint Probability Distribution:**\nP(X₁,...,Xₙ) = ∏ᵢ P(Xᵢ | Parents(Xᵢ))\n\n**Burglar Alarm Example (Pearl):**\n- Variables: Burglary (B), Earthquake (E), Alarm (A), JohnCalls (J), MaryCalls (M)\n- Joint Distribution: P(B,E,A,J,M) = P(B) · P(E) · P(A|B,E) · P(J|A) · P(M|A)\n\n**Inference by Enumeration:**\nTo compute P(B | j, m):\nP(B | j, m) = α · P(B, j, m) = α · ∑ₑ ∑ₐ P(B) · P(e) · P(a|B,e) · P(j|a) · P(m|a)\nSums over unobserved hidden variables (Earthquake and Alarm).'
          },
        ],
        partC: [
          {
            q: 'Given a Bayesian Network with variables B (Burglary), E (Earthquake), A (Alarm), J (JohnCalls), M (MaryCalls) with known prior and CPT values, derive the complete mathematical steps to calculate the probability that a burglary has occurred given that both John and Mary call: P(B = true | J = true, M = true).',
            a: '**Step-by-Step Derivation:**\nGiven:\nP(B) = 0.001, P(E) = 0.002\nP(A|B,E)=0.95, P(A|B,¬E)=0.94, P(A|¬B,E)=0.29, P(A|¬B,¬E)=0.001\nP(J|A)=0.90, P(J|¬A)=0.05\nP(M|A)=0.70, P(M|¬A)=0.01\n\n**Goal:** Calculate P(b | j, m) = α · P(b, j, m)\nP(b, j, m) = ∑ₑ ∑ₐ P(b) P(e) P(a|b,e) P(j|a) P(m|a)\n= P(b) ∑ₑ P(e) [ P(a|b,e) P(j|a) P(m|a) + P(¬a|b,e) P(j|¬a) P(m|¬a) ]\n\nFor B = true:\nP(b, j, m) ≈ 0.00059224\n\nFor B = false:\nP(¬b, j, m) ≈ 0.0014919\n\nNormalizing constant α = 1 / (0.00059224 + 0.0014919) = 1 / 0.00208414 ≈ 479.8\n\nP(B = true | j, m) = 0.00059224 / 0.00208414 ≈ 0.284 (28.4% probability)\n\n*Conclusion: Even though both neighbors called, because Burglary has a tiny prior (0.1%), the posterior is 28.4%.*'
          },
        ],
        notes: [
          {
            title: 'Planning & Bayes Key Formulas',
            points: [
              'Joint Distribution: P(X1..Xn) = ∏ P(Xi | Parents(Xi))',
              'Bayes Rule: P(H|E) = P(E|H)P(H) / P(E)',
              'Exact inference is NP-hard in general; Variable Elimination uses dynamic programming',
            ]
          },
        ],
        quiz: [
          {
            q: 'In a Bayesian Network with 5 binary variables, how many parameters are needed if each node has at most 2 parents?',
            options: ['32', 'At most 5 × 4 = 20', '64', '5'],
            answerIndex: 1,
            explanation: 'Each node with k parents needs 2^k independent probabilities. For k=2, 2²=4 values per node, requiring at most ~20 values, compared to 2⁵-1 = 31 for full joint.'
          },
        ],
      },

      // --- UNIT 5 ---
      {
        unitNo: 5,
        title: 'Machine Learning & Expert Systems',
        topics: ['Inductive Learning', 'Decision Trees', 'Entropy & Information Gain', 'Ensemble Methods', 'Reinforcement Learning', 'Markov Decision Process (MDP)', 'Q-Learning', 'Expert System Architecture'],
        partA: [
          {
            q: 'Define Entropy and Information Gain in Decision Tree learning.',
            a: 'Entropy H(S) = -∑ pᵢ log₂(pᵢ) measures the impurity of set S. Information Gain IG(S, A) = H(S) - ∑ (|Sᵥ|/|S|) H(Sᵥ) measures the expected reduction in entropy achieved by partitioning on attribute A.'
          },
          {
            q: 'What is Q-Learning? Write the Bellman update equation.',
            a: 'Q-Learning is a model-free, off-policy temporal difference reinforcement learning algorithm. Update rule: Q(s, a) ← Q(s, a) + α [r + γ max_a\' Q(s\', a\') - Q(s, a)], where α is learning rate and γ is discount factor.'
          },
          {
            q: 'State the key components of an Expert System.',
            a: 'An Expert System consists of: (1) Knowledge Base (rules and domain facts), (2) Inference Engine (forward/backward chaining reasoner), (3) Working Memory (current case facts), (4) Explanation Facility (justifies deductions), and (5) User Interface.'
          },
          {
            q: 'Differentiate supervised, unsupervised, and reinforcement learning.',
            a: 'Supervised: learns from labeled input-output pairs (x, y). Unsupervised: discovers hidden patterns in unlabeled data x (clustering). Reinforcement Learning: agent learns optimal policy by trial-and-error interacting with environment receiving reward signals.'
          },
          {
            q: 'What is overfitting in decision trees and how is it prevented?',
            a: 'Overfitting occurs when a tree memorizes training noise rather than true concepts, resulting in low training error but high generalization error. Prevented by: (1) Pre-pruning (stopping tree growth early), (2) Post-pruning (cost-complexity pruning using validation set).'
          },
        ],
        partB: [
          {
            q: 'Explain the ID3 Decision Tree algorithm with complete pseudocode. Show how Information Gain is calculated.',
            a: '**ID3 (Iterative Dichotomiser 3) Algorithm:**\n```\nID3(Examples, Target_Attribute, Attributes):\n  Create Root node for tree\n  If all Examples are positive: Return single-node tree Root with label = +\n  If all Examples are negative: Return single-node tree Root with label = -\n  If Attributes is empty: Return Root with label = most common value in Examples\n  A = attribute from Attributes that maximizes InformationGain(Examples, A)\n  Root = decision attribute A\n  For each possible value v of A:\n    Add a new branch below Root corresponding to test A = v\n    Examples_v = subset of Examples where A = v\n    If Examples_v is empty:\n      Add leaf with label = most common value of Target_Attribute in Examples\n    Else:\n      Add subtree ID3(Examples_v, Target_Attribute, Attributes - {A})\n  Return Root\n```'
          },
          {
            q: 'Explain Q-Learning in Reinforcement Learning. Contrast exploration vs exploitation with epsilon-greedy strategy.',
            a: '**Q-Learning Algorithm:**\n1. Initialize Q(s, a) arbitrarily (e.g., zeros) for all states and actions\n2. For each episode:\n   - Initialize state s\n   - For each step:\n     - Choose action a using ε-greedy policy:\n       * With probability ε: choose random action (exploration)\n       * With probability 1-ε: choose a = argmax_a Q(s, a) (exploitation)\n     - Take action a, observe reward r and next state s\'\n     - Update Q-table: Q(s, a) ← Q(s, a) + α [r + γ max_a\' Q(s\', a\') - Q(s, a)]\n     - s ← s\'\n   - Until s is terminal state\n\n**Exploration vs Exploitation:** Exploration tries untried actions to discover high rewards; exploitation reaps known high rewards. Epsilon decays over time (e.g. ε = max(0.01, ε · 0.995)).'
          },
        ],
        partC: [
          {
            q: 'Explain the architecture and working of a Rule-Based Expert System. Contrast it with modern Machine Learning approaches in AI.',
            a: '**Expert System Architecture:**\n1. **Knowledge Base:** Domain knowledge represented as IF-THEN rules (e.g., IF fever > 102 AND rash THEN suspect dengue)\n2. **Working Memory:** Dynamic cache of current case observations and intermediate inferences\n3. **Inference Engine:** Applies Modus Ponens via Forward Chaining (data-driven synthesis) or Backward Chaining (diagnostic hypothesis testing). Conflict resolution resolves competing rules.\n4. **Explanation Subsystem:** Answers "WHY" (why is this question asked?) and "HOW" (how was this conclusion reached?) using the proof tree.\n\n**Comparison: Expert Systems vs Machine Learning:**\n| Criterion | Rule-Based Expert Systems | Machine Learning (Modern AI) |\n|---|---|---|\n| Knowledge Source | Human domain experts (Knowledge engineers) | Big data / raw observations |\n| Explainability | 100% transparent rule-trace explanations | Often "black-box" (deep networks) |\n| Handling Novel Data | Brittle — fails on unmodeled inputs | High generalization capability |\n| Maintenance | Manual rule maintenance (combinatorial explosion) | Automated retraining on new data |\n| Uncertainty | Certainty factors / Fuzzy rules | Rigorous probabilistic distributions |'
          },
        ],
        notes: [
          {
            title: 'Learning & Expert System Fundamentals',
            points: [
              'ID3 uses Information Gain; C4.5 uses Gain Ratio to prevent bias toward many-valued attributes',
              'Q-learning is off-policy: target policy is greedy while behavior policy is ε-greedy',
              'Expert systems provide explicit audit trails and explanation facilities',
            ]
          },
        ],
        quiz: [
          {
            q: 'In Q-Learning, the discount factor γ (gamma) close to 0 causes the agent to:',
            options: ['Prioritize long-term future rewards', 'Consider only immediate rewards (myopic)', 'Ignore all rewards', 'Explore infinitely'],
            answerIndex: 1,
            explanation: 'When γ = 0, the agent only cares about the immediate reward r, making it shortsighted or myopic.'
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // SUBJECT 2: AD3351 — DESIGN AND ANALYSIS OF ALGORITHMS (UNITS 1 - 5)
  // ==========================================================================
  {
    code: 'AD3351',
    name: 'Design and Analysis of Algorithms',
    units: [
      // --- UNIT 1 ---
      {
        unitNo: 1,
        title: 'Algorithm Analysis & Divide and Conquer',
        topics: ['Asymptotic Notations', 'Recurrence Relations', 'Master Theorem', 'Merge Sort', 'Quick Sort', 'Binary Search', 'Strassen\'s Matrix Multiplication'],
        partA: [
          {
            q: 'Define Big-O notation with mathematical definition.',
            a: 'f(n) = O(g(n)) if there exist positive constants c and n₀ such that f(n) ≤ c·g(n) for all n ≥ n₀. It represents the upper bound (worst-case) growth rate of an algorithm.'
          },
          {
            q: 'State the Master Theorem for solving recurrence relations.',
            a: 'For T(n) = aT(n/b) + f(n): Case 1: If f(n) = O(n^(log_b(a)-ε)), then T(n) = Θ(n^(log_b(a))). Case 2: If f(n) = Θ(n^(log_b(a))), then T(n) = Θ(n^(log_b(a))·log n). Case 3: If f(n) = Ω(n^(log_b(a)+ε)) and af(n/b) ≤ cf(n), then T(n) = Θ(f(n)).'
          },
          {
            q: 'What is the recurrence relation for Merge Sort?',
            a: 'T(n) = 2T(n/2) + O(n), with T(1) = O(1). By Master Theorem (Case 2): a=2, b=2, log_b(a)=1, f(n)=n=Θ(n^1). Therefore T(n) = Θ(n log n) for all cases (best, average, worst).'
          },
          {
            q: 'Differentiate between Big-O, Big-Ω, and Big-Θ notations.',
            a: 'Big-O: Upper bound — f(n) ≤ c·g(n) (worst case). Big-Ω: Lower bound — f(n) ≥ c·g(n) (best case). Big-Θ: Tight bound — c₁·g(n) ≤ f(n) ≤ c₂·g(n) (exact growth rate). Example: Merge Sort is Θ(n log n), meaning both O(n log n) and Ω(n log n).'
          },
          {
            q: 'What is the worst-case time complexity of Quick Sort and when does it occur?',
            a: 'Worst case: O(n²), occurring when the pivot is always the smallest or largest element (already sorted or reverse sorted array). Recurrence: T(n) = T(n-1) + T(0) + Θ(n) = T(n-1) + Θ(n). Average case is O(n log n) with randomized pivot selection.'
          },
        ],
        partB: [
          {
            q: 'Explain the Merge Sort algorithm with pseudocode. Derive its time complexity using recurrence relations.',
            a: '**Merge Sort Algorithm:**\nDivide-and-conquer strategy:\n1. Divide array into two halves\n2. Recursively sort each half\n3. Merge two sorted halves\n\n**Pseudocode:**\n```\nMERGE-SORT(A, p, r):\n  if p < r:\n    q = ⌊(p+r)/2⌋\n    MERGE-SORT(A, p, q)\n    MERGE-SORT(A, q+1, r)\n    MERGE(A, p, q, r)\n\nMERGE(A, p, q, r):\n  Create L[1..n1], R[1..n2]\n  Copy A[p..q] to L, A[q+1..r] to R\n  i=1, j=1, k=p\n  while i≤n1 and j≤n2:\n    if L[i] ≤ R[j]: A[k]=L[i]; i++\n    else: A[k]=R[j]; j++\n    k++\n  Copy remaining elements\n```\n\n**Time Complexity Derivation:**\nRecurrence: T(n) = 2T(n/2) + cn\nUsing Master Theorem: a=2, b=2, f(n)=cn\nlog_b(a) = log₂2 = 1\nf(n) = cn = Θ(n^1) → Case 2\nT(n) = Θ(n log n)\n\nStable sort, Space: O(n) auxiliary'
          },
          {
            q: 'Explain the Quick Sort algorithm. Analyze its best, average, and worst case complexities.',
            a: '**Quick Sort Analysis:**\n- **Best Case:** T(n) = 2T(n/2) + Θ(n) = Θ(n log n) — balanced partition\n- **Average Case:** T(n) = Θ(n log n) — random pivots give balanced splits on average\n- **Worst Case:** T(n) = T(n-1) + Θ(n) = Θ(n²) — already sorted, pivot always extreme\n\n**Randomized Quick Sort:** Randomly choose pivot to guarantee O(n log n) with high probability.'
          },
        ],
        partC: [
          {
            q: 'Explain Divide and Conquer paradigm with Merge Sort and Strassen\'s Matrix Multiplication. Derive time complexities for both algorithms.',
            a: '**Strassen\'s Matrix Multiplication:**\nMultiply two n×n matrices.\n- Standard matrix multiplication: 8 multiplications of n/2 × n/2 submatrices → O(n³)\n- Strassen\'s algorithm computes 7 matrix products (M₁ to M₇) with 18 additions/subtractions\n\n**Recurrence:** T(n) = 7T(n/2) + Θ(n²)\nMaster Theorem: a=7, b=2, log₂7 ≈ 2.807\nf(n) = n² = O(n^(2.807 - ε))\n→ Case 1: T(n) = Θ(n^(log₂7)) ≈ Θ(n^2.807)\nFaster than naive O(n³) for large matrices (n > 45 in practice).'
          },
        ],
        notes: [
          {
            title: 'Sorting Complexities Reference',
            points: [
              'Merge Sort: Best/Avg/Worst Θ(n log n), Space O(n), Stable: Yes',
              'Quick Sort: Best/Avg Θ(n log n), Worst O(n²), Space O(log n), Stable: No',
              'Heap Sort: Best/Avg/Worst O(n log n), Space O(1), Stable: No',
            ]
          },
        ],
        quiz: [
          {
            q: 'What is the worst-case time complexity of Merge Sort?',
            options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
            answerIndex: 1,
            explanation: 'Merge Sort always divides array in half and merges in linear time, guaranteeing Θ(n log n) even in worst case.'
          },
        ],
      },

      // --- UNIT 2 ---
      {
        unitNo: 2,
        title: 'Dynamic Programming & Greedy Algorithms',
        topics: ['Principle of Optimality', '0/1 Knapsack Problem', 'Longest Common Subsequence (LCS)', 'Floyd-Warshall Algorithm', 'Matrix Chain Multiplication', 'Greedy Choice Property', 'Fractional Knapsack', 'Prim\'s & Kruskal\'s MST', 'Huffman Coding'],
        partA: [
          {
            q: 'State the Principle of Optimality in Dynamic Programming.',
            a: 'The principle of optimality states that an optimal policy has the property that whatever the initial state and initial decision are, the remaining decisions must constitute an optimal policy with regard to the state resulting from the first decision (Bellman, 1957).'
          },
          {
            q: 'Differentiate between Greedy Algorithm and Dynamic Programming.',
            a: 'Greedy makes a locally optimal choice at each step without reconsidering past decisions, time complexity is typically lower, but does not guarantee global optimum for all problems. Dynamic Programming solves all overlapping subproblems once, stores results in a table (memoization/tabulation), and guarantees global optimum by exploring all choices.'
          },
          {
            q: 'What is the greedy choice property and optimal substructure?',
            a: 'Greedy Choice Property: A globally optimal solution can be arrived at by making a locally optimal (greedy) choice at each stage. Optimal Substructure: An optimal solution to the problem contains within it optimal solutions to subproblems.'
          },
          {
            q: 'Write the recurrence relation for the 0/1 Knapsack problem.',
            a: 'V[i, w] = V[i-1, w] if wᵢ > w; otherwise max(V[i-1, w], V[i-1, w - wᵢ] + vᵢ), where V[i, w] is the maximum value using a subset of the first i items with weight capacity w. Base cases: V[0, w] = 0 and V[i, 0] = 0.'
          },
          {
            q: 'What is the time complexity of the Floyd-Warshall algorithm?',
            a: 'Floyd-Warshall runs in Θ(V³) time and requires Θ(V²) space, where V is the number of vertices. It computes all-pairs shortest paths on directed graphs with positive or negative edge weights (no negative-weight cycles).'
          },
        ],
        partB: [
          {
            q: 'Explain the 0/1 Knapsack problem using Dynamic Programming. Provide the pseudocode and trace an example with weights [2, 3, 4, 5], values [3, 4, 5, 6], and capacity W = 5.',
            a: '**0/1 Knapsack Problem via Dynamic Programming:**\nRecurrence: V[i, w] = max(V[i-1, w], V[i-1, w - wᵢ] + vᵢ)\n\n**Trace Table for W = 5:**\n- Items: (w₁=2, v₁=3), (w₂=3, v₂=4), (w₃=4, v₃=5), (w₄=5, v₄=6)\n- V[4, 5] = 7 (Achieved by taking Item 1 [w=2, v=3] + Item 2 [w=3, v=4], total weight = 5 ≤ 5).\n- Complexity: Time O(nW), Space O(nW) reducible to O(W).'
          },
          {
            q: 'Compare Prim\'s and Kruskal\'s algorithms for finding Minimum Spanning Tree (MST).',
            a: '**Comparison of MST Algorithms:**\n- **Prim\'s:** Vertex-based greedy growth from a single root. Time O(E log V) with binary heap. Best suited for dense graphs (E ≈ V²).\n- **Kruskal\'s:** Edge-based greedy merging using Disjoint-Set Union-Find. Time O(E log E) = O(E log V) dominated by edge sorting. Best suited for sparse graphs (E ≪ V²).'
          },
        ],
        partC: [
          {
            q: 'Explain the Floyd-Warshall algorithm for All-Pairs Shortest Paths. Write the complete algorithm, explain the recurrence, and trace with a 4-vertex directed graph.',
            a: '**Floyd-Warshall Algorithm:**\nRecurrence: D^(k)[i, j] = min(D^(k-1)[i, j], D^(k-1)[i, k] + D^(k-1)[k, j])\nThree nested loops k, i, j from 1 to V.\nTime Complexity: Θ(V³)\nSpace Complexity: Θ(V²)\nDetects negative-weight cycles if D[i, i] < 0 for any vertex i.'
          },
        ],
        notes: [
          {
            title: 'DP vs Greedy Decisions',
            points: [
              'Fractional Knapsack → Greedy (O(n log n))',
              '0/1 Knapsack → DP (O(nW))',
              'Single Source Shortest Path → Dijkstra (Greedy, non-negative weights)',
              'All-Pairs Shortest Path → Floyd-Warshall (DP, O(V³))',
            ]
          },
        ],
        quiz: [
          {
            q: 'The time complexity of the Floyd-Warshall algorithm is:',
            options: ['O(V²)', 'O(V³)', 'O(V log V)', 'O(E log V)'],
            answerIndex: 1,
            explanation: 'Floyd-Warshall executes 3 nested loops each running V times, giving Θ(V³).'
          },
        ],
      },

      // --- UNIT 3 ---
      {
        unitNo: 3,
        title: 'Graph Algorithms & Network Flow',
        topics: ['Dijkstra Algorithm', 'Bellman-Ford Algorithm', 'Topological Sort', 'Strongly Connected Components (Kosaraju / Tarjan)', 'Maximum Flow Problem', 'Ford-Fulkerson Method', 'Max-Flow Min-Cut Theorem'],
        partA: [
          {
            q: 'Why cannot Dijkstra\'s algorithm handle negative edge weights?',
            a: 'Dijkstra assumes that once a vertex is visited and added to the finalized set S, its shortest distance cannot be decreased by discovering any further paths. A negative edge can provide a shorter path to a previously finalized vertex, violating this greedy premise. Bellman-Ford must be used instead.'
          },
          {
            q: 'State the Bellman-Ford algorithm and its time complexity.',
            a: 'Bellman-Ford solves single-source shortest paths on graphs with arbitrary (positive or negative) edge weights. It relaxes all |E| edges |V|-1 times. Time complexity: O(V·E). An extra |V|-th pass detects negative-weight cycles.'
          },
          {
            q: 'Define Topological Sort of a Directed Acyclic Graph (DAG).',
            a: 'A topological sort is a linear ordering of vertices such that for every directed edge (u, v), vertex u comes before vertex v in the ordering. It exists if and only if the directed graph has no directed cycles (DAG).'
          },
          {
            q: 'State the Max-Flow Min-Cut Theorem.',
            a: 'The Max-Flow Min-Cut theorem states that the maximum amount of flow passing from source s to sink t in a network equals the minimum capacity among all s-t cuts in the network.'
          },
          {
            q: 'What is an augmenting path in the Ford-Fulkerson method?',
            a: 'An augmenting path is a simple directed path from source s to sink t in the residual network G_f with available residual capacity c_f(p) > 0 along all its edges.'
          },
        ],
        partB: [
          {
            q: 'Explain Dijkstra\'s single-source shortest path algorithm with pseudocode and trace for a weighted graph.',
            a: '**Dijkstra\'s Algorithm:**\n```\nDIJKSTRA(G, w, s):\n  for each v in V:\n    dist[v] = ∞; prev[v] = null\n  dist[s] = 0\n  Q = min-priority queue with all v in V keyed by dist[v]\n  while Q is not empty:\n    u = EXTRACT-MIN(Q)\n    for each neighbor v of u:\n      alt = dist[u] + w(u, v)\n      if alt < dist[v]:\n        dist[v] = alt\n        prev[v] = u\n        DECREASE-KEY(Q, v, alt)\n  return dist, prev\n```\n**Complexity:** O((V + E) log V) with binary min-heap; O(E + V log V) with Fibonacci heap.'
          },
          {
            q: 'Explain the Bellman-Ford algorithm and how it detects negative weight cycles.',
            a: '**Bellman-Ford Algorithm:**\n1. Initialize: dist[s] = 0, all other dist[v] = ∞\n2. For i = 1 to |V| - 1:\n   - For each edge (u, v) with weight w:\n     if dist[u] + w < dist[v]:\n       dist[v] = dist[u] + w\n3. Negative Cycle Check (Pass |V|):\n   - For each edge (u, v) with weight w:\n     if dist[u] + w < dist[v]:\n       return "Graph contains negative-weight cycle!"\n4. Return dist arrays.'
          },
        ],
        partC: [
          {
            q: 'Explain the Ford-Fulkerson method for finding Maximum Flow in a flow network. Define residual network, augmenting path, and prove the Max-Flow Min-Cut theorem.',
            a: '**Ford-Fulkerson Method:**\n```\nFORD-FULKERSON(G, s, t):\n  initialize flow f(u, v) = 0 for all edges\n  while there exists an augmenting path p in residual network G_f:\n    c_f(p) = min{ c_f(u, v) : (u, v) in p }\n    for each edge (u, v) in p:\n      if (u, v) is forward edge:\n        f(u, v) = f(u, v) + c_f(p)\n      else (backward edge):\n        f(v, u) = f(v, u) - c_f(p)\n  return f\n```\n**Max-Flow Min-Cut Theorem Proof:**\nLet (S, T) be a cut such that s ∈ S and t ∈ T. Capacity of cut c(S, T) = ∑_{u∈S, v∈T} c(u, v).\n1. For any flow f and cut (S, T), |f| ≤ c(S, T).\n2. When no augmenting path exists in G_f, define S = {v ∈ V : v reachable from s in G_f} and T = V - S.\n   Then |f| = c(S, T). Hence, the maximum flow equals the minimum cut capacity.'
          },
        ],
        notes: [
          {
            title: 'Graph Algorithm Summary',
            points: [
              'Dijkstra: O((V+E) log V) — cannot handle negative edges',
              'Bellman-Ford: O(V·E) — handles negative weights & detects negative cycles',
              'Edmonds-Karp (Ford-Fulkerson with BFS): O(V·E²)',
              'Kosaraju SCC: 2 DFS passes on G and G^T in O(V + E)',
            ]
          },
        ],
        quiz: [
          {
            q: 'What is the time complexity of the Bellman-Ford algorithm?',
            options: ['O(V + E)', 'O(E log V)', 'O(V · E)', 'O(V³)'],
            answerIndex: 2,
            explanation: 'Bellman-Ford relaxes all E edges V-1 times, resulting in O(V · E) time complexity.'
          },
        ],
      },

      // --- UNIT 4 ---
      {
        unitNo: 4,
        title: 'Backtracking & Branch and Bound',
        topics: ['Backtracking Paradigm', 'N-Queens Problem', 'Subset Sum Problem', 'Graph Coloring', 'Hamiltonian Circuit', 'Branch and Bound Paradigm', '0/1 Knapsack B&B', 'Traveling Salesperson Problem (TSP) B&B'],
        partA: [
          {
            q: 'Differentiate between Backtracking and Branch and Bound.',
            a: 'Backtracking uses Depth-First Search (DFS) with bounding functions to prune infeasible state space branches; it is used for decision and constraint problems. Branch and Bound uses Breadth-First Search (BFS) or Best-First Search with lower/upper cost bounds to solve optimization problems.'
          },
          {
            q: 'State the bounding function used in the N-Queens problem.',
            a: 'A placement of queen k at column j is valid if no previously placed queen i (for 1 ≤ i < k) shares the same column (x[i] = j) or the same diagonal (|x[i] - j| = |i - k|).'
          },
          {
            q: 'What is the state space tree in backtracking?',
            a: 'A state space tree is a conceptual tree representation where the root represents the initial state before any decisions, internal nodes represent partial solutions, and leaves represent complete solutions or dead ends.'
          },
          {
            q: 'Explain the Least Cost (LC) Branch and Bound search strategy.',
            a: 'LC-Branch and Bound selects the next node to expand from the active queue that has the minimum estimated lower bound ĉ(x) on the optimal solution cost, guiding search toward promising leaves faster.'
          },
          {
            q: 'Define Chromatic Number in graph coloring.',
            a: 'The chromatic number χ(G) of a graph G is the smallest number of colors needed to color the vertices of G such that no two adjacent vertices share the same color.'
          },
        ],
        partB: [
          {
            q: 'Explain the 8-Queens problem using Backtracking with recursive algorithm and state space tree visualization.',
            a: '**N-Queens Backtracking Algorithm:**\n```\nNQUEENS(k, n):\n  for col = 1 to n:\n    if PLACE(k, col):\n      x[k] = col\n      if k == n:\n        print x[1..n]  // Solution found\n      else:\n        NQUEENS(k + 1, n)\n\nPLACE(k, col):\n  for i = 1 to k - 1:\n    if x[i] == col or abs(x[i] - col) == abs(i - k):\n      return false\n  return true\n```\nPrunes branches immediately when diagonal or column conflicts arise, exploring a tiny fraction of the 8⁸ = 16.7 million configurations.'
          },
          {
            q: 'Explain how the Traveling Salesperson Problem (TSP) is solved using Branch and Bound with reduced matrix technique.',
            a: '**TSP by Branch and Bound (Reduced Matrix):**\n1. Row reduction: Subtract row minimum from each row; add minimums to cost bound.\n2. Column reduction: Subtract column minimum from each column; add to cost bound.\n3. Root lower bound = sum of all reductions.\n4. Branching: Choose edge (i, j). In child node setting path i → j: set row i = ∞, col j = ∞, entry (j, 1) = ∞. Re-reduce matrix.\n5. Expand node with lowest lower bound until complete tour found.'
          },
        ],
        partC: [
          {
            q: 'Solve the Subset Sum problem for S = {3, 5, 6, 7} and target sum d = 15 using Backtracking. Draw the complete state space tree with bounding criteria.',
            a: '**Subset Sum Backtracking Formulation:**\nSort elements: S = {3, 5, 6, 7}\nBounding condition at node with current sum s and remaining total r:\n- If s + S[k] > d: prune (exceeds target sum)\n- If s + r < d: prune (cannot reach target even taking all remaining elements)\n\n**State Space Tree Generation:**\n- Root (s=0, r=21)\n- Take 3 (s=3, r=18)\n  - Take 5 (s=8, r=13)\n    - Take 6 (s=14, r=7) → Cannot reach 15 taking 7 (14+7=21>15)\n    - Skip 6 (s=8, r=7) → Take 7: s = 8 + 7 = 15 **[SOLUTION 1: {3, 5, 7}]**\n- Skip 3 (s=0, r=18)\n  - Take 5 (s=5, r=13)\n    - Take 6 (s=11, r=7) → Cannot reach 15 (11+7=18>15)\n  - Skip 5 (s=0, r=13)\n    - Cannot reach 15 (6 + 7 = 13 < 15) → Prune\n\n**Unique Solution:** {3, 5, 7} sum = 15.'
          },
        ],
        notes: [
          {
            title: 'Backtracking & B&B Principles',
            points: [
              'Backtracking = Depth-First Search + Bounding function (prunes dead ends)',
              'Branch & Bound = Best-First Search + Lower bounds (solves optimization problems)',
              'N-Queens checks: x[i] == x[k] or abs(x[i]-x[k]) == abs(i-k)',
            ]
          },
        ],
        quiz: [
          {
            q: 'Which search strategy is typically used in Branch and Bound algorithms?',
            options: ['Pure Depth-First Search', 'FIFO (Breadth-First) or Least-Cost (Best-First) Search', 'Hill Climbing', 'Iterative Deepening'],
            answerIndex: 1,
            explanation: 'Branch and Bound utilizes FIFO queues (BFS) or priority queues (Least-Cost Best-First search) ordered by lower bound.'
          },
        ],
      },

      // --- UNIT 5 ---
      {
        unitNo: 5,
        title: 'Tractability & Approximation Algorithms',
        topics: ['P and NP Classes', 'NP-Complete & NP-Hard', 'Cook\'s Theorem', 'Polynomial Time Reductions', 'Vertex Cover Approximation', 'Traveling Salesperson Problem Approximation', 'Set Cover Problem'],
        partA: [
          {
            q: 'Define class P and class NP with examples.',
            a: 'Class P: Decision problems solvable in polynomial time O(n^k) on a deterministic Turing machine (e.g., Shortest Path, Minimum Spanning Tree). Class NP: Decision problems verifiable in polynomial time on a deterministic machine, or solvable in polynomial time on a non-deterministic Turing machine (e.g., Hamiltonian Circuit, Traveling Salesperson).'
          },
          {
            q: 'What is an NP-Complete problem? State Cook\'s Theorem.',
            a: 'A problem X is NP-Complete if: (1) X ∈ NP, and (2) Every problem Y in NP is polynomial-time reducible to X (X is NP-hard). Cook\'s Theorem (1971) proved that Boolean Satisfiability (SAT) is the first known NP-Complete problem.'
          },
          {
            q: 'What is an approximation ratio of an approximation algorithm?',
            a: 'An algorithm has an approximation ratio ρ(n) if for any input of size n, the cost C of the solution satisfies max(C/C*, C*/C) ≤ ρ(n), where C* is the optimal cost. A 2-approximation algorithm produces solutions within a factor of 2 of optimal.'
          },
          {
            q: 'Explain the 2-approximation algorithm for Vertex Cover.',
            a: 'Repeatedly select an arbitrary edge (u, v), add both u and v to the vertex cover C, and remove all edges incident to u or v from E. Because both endpoints are added, |C| ≤ 2·|C*|, guaranteeing a polynomial-time 2-approximation.'
          },
          {
            q: 'What is polynomial-time reduction?',
            a: 'A problem A is polynomial-time reducible to problem B (written A ≤_p B) if any instance of A can be converted into an instance of B in polynomial time such that the answer to B is YES if and only if the answer to A is YES.'
          },
        ],
        partB: [
          {
            q: 'Explain the relation between P, NP, NP-Complete, and NP-Hard problems with a Venn diagram description.',
            a: '**Classes of Complexity:**\n- **P:** Solvable in polynomial time deterministic machine (P ⊆ NP).\n- **NP:** Verifiable in polynomial time.\n- **NP-Hard:** At least as hard as the hardest problem in NP. Does not need to be in NP.\n- **NP-Complete:** Intersection of NP and NP-Hard (NPC = NP ∩ NP-Hard).\n\nIf any single NP-Complete problem is proven to be solvable in polynomial time, then P = NP.'
          },
          {
            q: 'Explain the 2-approximation algorithm for the Metric Traveling Salesperson Problem (TSP) using Minimum Spanning Tree.',
            a: '**Metric TSP 2-Approximation Algorithm:**\nAssumption: Triangle inequality holds: c(u, v) ≤ c(u, w) + c(w, v).\n\n**Algorithm:**\n1. Compute a Minimum Spanning Tree (MST) T of G using Prim\'s algorithm (cost(T) < cost(OPT_tour)).\n2. Double every edge of T to create an Eulerian multigraph.\n3. Find an Eulerian tour that visits every edge.\n4. Form a Hamiltonian cycle by skipping already visited vertices (shortcutting).\n\n**Approximation Ratio Proof:**\nCost of Euler tour = 2 · cost(T) ≤ 2 · cost(OPT_tour).\nBy triangle inequality, shortcutting does not increase cost.\nTherefore, cost(Approximation_Tour) ≤ 2 · cost(OPT_tour).'
          },
        ],
        partC: [
          {
            q: 'Prove that the Vertex Cover problem is NP-Complete by polynomial time reduction from the 3-CNF Satisfiability (3-SAT) problem.',
            a: '**Proof Structure (3-SAT ≤_p Vertex Cover):**\n1. **Vertex Cover ∈ NP:** Given a candidate certificate of k vertices, verifying whether every edge in G has at least one endpoint in C takes O(V + E) polynomial time.\n\n2. **Reduction from 3-SAT:**\nLet φ be a 3-CNF formula with m clauses C₁...Cₘ over n variables x₁...xₙ.\n- **Variable Gadget:** For each variable xᵢ, create two vertices labeled xᵢ and ¬xᵢ connected by an edge (xᵢ, ¬xᵢ). Exactly 1 vertex must be in cover.\n- **Clause Gadget:** For each clause Cⱼ = (l₁ ∨ l₂ ∨ l₃), create a triangle of 3 vertices connected to each other. At least 2 vertices must be in cover.\n- **Connecting Edges:** Connect each literal vertex in the clause triangle to its corresponding literal vertex in the variable gadgets.\n- Set budget k = n + 2m.\n\n3. **Equivalence (φ is satisfiable ↔ G has vertex cover of size k):**\n- If φ is satisfied: pick true literal in each variable gadget (n vertices) and pick 2 non-satisfying literals in each clause triangle (2m vertices). Total = n + 2m = k vertices, covering all edges.\n- If G has vertex cover of size n + 2m: exactly 1 literal per variable is picked, giving a consistent truth assignment that satisfies all clauses.\n\nSince 3-SAT is NP-Complete, Vertex Cover is NP-Complete.'
          },
        ],
        notes: [
          {
            title: 'Complexity Classes Summary',
            points: [
              'P: Polynomial time solvable',
              'NP: Polynomial time verifiable',
              'NPC: NP-Complete (SAT, 3-SAT, Vertex Cover, Clique, Subset Sum, TSP-Decision)',
              'Metric TSP has 2-approx (MST doubling) and 1.5-approx (Christofides)',
            ]
          },
        ],
        quiz: [
          {
            q: 'What is the approximation ratio of the MST-based metric Traveling Salesperson Problem algorithm?',
            options: ['1.0', '1.5', '2.0', 'log n'],
            answerIndex: 2,
            explanation: 'The MST doubling and shortcutting algorithm achieves a guaranteed 2-approximation ratio for metric TSP.'
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // SUBJECT 3: AD3501 — DEEP LEARNING (UNITS 1 - 5)
  // ==========================================================================
  {
    code: 'AD3501',
    name: 'Deep Learning',
    units: [
      // --- UNIT 1 ---
      {
        unitNo: 1,
        title: 'Neural Network Foundations & Optimization',
        topics: ['Perceptron', 'Multilayer Perceptron', 'Activation Functions', 'Backpropagation', 'Gradient Descent Variants', 'Regularization (L1/L2, Dropout)', 'Vanishing Gradients'],
        partA: [
          {
            q: 'What is a perceptron? Write its mathematical formulation.',
            a: 'A perceptron computes a weighted sum of inputs plus bias and applies an activation function: y = f(∑ᵢ wᵢxᵢ + b). In its original form, f is a step function; it can only classify linearly separable patterns.'
          },
          {
            q: 'Why is the XOR problem unsolvable by a single-layer perceptron?',
            a: 'XOR is not linearly separable — no single straight decision line in 2D space can separate (0,0) and (1,1) (output 0) from (0,1) and (1,0) (output 1). A Multilayer Perceptron (MLP) with at least one hidden layer is required.'
          },
          {
            q: 'Compare Sigmoid, Tanh, and ReLU activation functions.',
            a: 'Sigmoid: f(x) = 1/(1+e⁻ˣ), range (0, 1), suffers from vanishing gradients. Tanh: range (-1, 1), zero-centered, still suffers from vanishing gradients. ReLU: f(x) = max(0, x), range [0, ∞), does not saturate for x > 0, highly efficient, but can suffer from "dying ReLU".'
          },
          {
            q: 'What is Dropout regularization and how does it prevent overfitting?',
            a: 'Dropout randomly deactivates a fraction p (e.g. 0.5) of neurons during each forward/backward pass during training. This prevents co-adaptation of features and acts like training an ensemble of exponentially many thinned networks.'
          },
          {
            q: 'State the vanishing gradient problem and its main causes.',
            a: 'In deep networks using saturating activations (Sigmoid/Tanh), gradients of the loss with respect to early layer weights shrink exponentially during backpropagation (chain rule multiplication of values < 0.25), stalling learning in initial layers. Solved by ReLU, Batch Normalization, and Residual Connections.'
          },
        ],
        partB: [
          {
            q: 'Derive the Backpropagation algorithm for a 2-layer neural network using the Chain Rule of Calculus.',
            a: '**Backpropagation Derivation:**\n- Network: Input x → Hidden h = σ(W₁x + b₁) → Output ŷ = σ(W₂h + b₂)\n- Loss: L = 1/2 (y - ŷ)²\n\n**Output Layer Gradient:**\n- ∂L/∂ŷ = -(y - ŷ)\n- ∂L/∂z₂ = ∂L/∂ŷ · σ\'(z₂) = -(y - ŷ) · ŷ(1 - ŷ) = δ₂\n- ∂L/∂W₂ = δ₂ · hᵀ\n- ∂L/∂b₂ = δ₂\n\n**Hidden Layer Gradient (Backpropagated Error):**\n- ∂L/∂h = W₂ᵀ · δ₂\n- δ₁ = (W₂ᵀ · δ₂) ⊙ σ\'(z₁)\n- ∂L/∂W₁ = δ₁ · xᵀ\n- ∂L/∂b₁ = δ₁\n\n**Weight Updates:**\nW ← W - η(∂L/∂W)'
          },
          {
            q: 'Compare Batch Gradient Descent, Stochastic Gradient Descent (SGD), and Adam optimizer.',
            a: '**Gradient Descent Variants:**\n1. **Batch GD:** Computes ∇L over entire dataset. Stable, but slow and memory-intensive.\n2. **SGD:** Computes ∇L on 1 sample per step. Fast and escapes local minima, but noisy.\n3. **Mini-batch GD:** Computes ∇L on batches of 32-256 samples. Optimal compromise.\n4. **Adam (Adaptive Moment Estimation):** Combines Momentum (first moment m_t = β₁m_{t-1} + (1-β₁)g_t) and RMSprop (second moment v_t = β₂v_{t-1} + (1-β₂)g_t²). Maintains adaptive learning rates per parameter.'
          },
        ],
        partC: [
          {
            q: 'Explain the mathematical formulation, architecture, and training pipeline of Deep Multilayer Networks with comprehensive analysis of weight initialization (Xavier and He initialization).',
            a: '**Weight Initialization & Training Dynamics:**\n\n**1. The Problem with Naive Initialization:**\n- Initializing all weights to 0: All neurons compute identical gradients (symmetry breaking fails).\n- Initializing with large random weights: Activations saturate → vanishing/exploding gradients.\n\n**2. Xavier (Glorot) Initialization (for Sigmoid/Tanh):**\n- Variance condition: Var(a^{[l]}) = Var(a^{[l-1]})\n- W ~ N(0, 2 / (n_{in} + n_{out}))\n- Preserves variance of activations and backpropagated gradients.\n\n**3. He (Kaiming) Initialization (for ReLU):**\n- Accounts for ReLU zeroing out half the inputs:\n- W ~ N(0, 2 / n_{in})\n- Essential for deep ReLU networks (prevents signal decay across 50+ layers).'
          },
        ],
        notes: [
          {
            title: 'Foundations & Activations Summary',
            points: [
              'ReLU: f(x) = max(0, x) prevents vanishing gradients for positive inputs',
              'He initialization: W ~ N(0, 2/n_in) tailored for ReLU',
              'Adam: Adaptive learning rates using first and second gradient moments',
              'L2 Regularization (Weight Decay): adds λ/2 ||W||² to loss',
            ]
          },
        ],
        quiz: [
          {
            q: 'Which weight initialization strategy is optimal for networks using ReLU activation?',
            options: ['All zeros', 'Xavier / Glorot initialization', 'He / Kaiming initialization', 'Uniform [0, 1]'],
            answerIndex: 2,
            explanation: 'He initialization sets variance to 2/n_in, compensating for the 50% activation dropout caused by ReLU.'
          },
        ],
      },

      // --- UNIT 2 ---
      {
        unitNo: 2,
        title: 'Convolutional Neural Networks (CNNs)',
        topics: ['Convolution Operation', 'Stride & Padding', 'Pooling Layers', 'LeNet & AlexNet', 'VGGNet & Inception', 'ResNet & Residual Blocks', 'Batch Normalization', 'Transfer Learning'],
        partA: [
          {
            q: 'Define convolution operation in CNNs and write the output dimension formula.',
            a: 'Convolution computes element-wise multiplication and sum between a kernel/filter and receptive field patch. Output dimension: O = ⌊(W - K + 2P)/S⌋ + 1, where W is input size, K is kernel size, P is padding, and S is stride.'
          },
          {
            q: 'What is the purpose of Max Pooling in CNNs?',
            a: 'Max pooling downsamples feature maps by taking the maximum value in a window. It: (1) Reduces spatial dimensions and parameter count, (2) Provides translation invariance, and (3) Expands the receptive field of subsequent layers.'
          },
          {
            q: 'What is a 1×1 convolution and why is it used in GoogLeNet/Inception?',
            a: 'A 1×1 convolution performs a linear combination across channels without altering spatial height and width. It is used as a bottleneck layer for dimensionality reduction (reducing number of feature maps), slashing computation before 3×3 and 5×5 convolutions.'
          },
          {
            q: 'Explain the core innovation of ResNet (Residual Networks).',
            a: 'ResNet introduces skip/residual identity shortcuts: F(x) + x. Instead of learning an unreferenced mapping H(x), layers fit a residual mapping F(x) = H(x) - x. This allows gradient flow directly through identity shortcuts, preventing vanishing gradients in networks with 100+ layers.'
          },
          {
            q: 'How does Batch Normalization accelerate CNN training?',
            a: 'Batch Normalization normalizes the activations of each layer across the mini-batch to have zero mean and unit variance, followed by a learnable scale (γ) and shift (β). It reduces internal covariate shift, enables higher learning rates, and acts as mild regularization.'
          },
        ],
        partB: [
          {
            q: 'Explain the VGG-16 architecture. Why did VGG choose stacks of small 3×3 filters over large 7×7 filters?',
            a: '**VGG-16 Architecture Insights:**\n- Two stacked 3×3 convolutions have an effective receptive field of a 5×5 convolution, but use 2 × (3²C²) = 18C² parameters instead of 25C² (28% parameter reduction).\n- Three stacked 3×3 convolutions have the receptive field of a 7×7 convolution, using 27C² parameters instead of 49C² (45% parameter reduction).\n- Incorporates more non-linear activation functions (ReLU after each 3×3), increasing discriminative power.'
          },
          {
            q: 'Explain the ResNet Residual Block with mathematical formulation and architectural diagram.',
            a: '**ResNet Residual Block:**\n- Desired mapping: H(x)\n- Residual mapping: F(x) = H(x) - x\n- Output: y = ReLU(F(x) + x)\n\n**Why Residual Connections Solve Degradation:**\n∂L/∂x = ∂L/∂H · (∂F/∂x + 1)\nThe "+1" term guarantees that gradient flows directly back to earlier layers without diminishing, even if ∂F/∂x approaches zero. Won ImageNet 2015 with 3.57% error.'
          },
        ],
        partC: [
          {
            q: 'Trace the architectural evolution of CNNs from LeNet-5, AlexNet, VGGNet, GoogLeNet to ResNet. Compare their layer depths, parameter counts, and foundational breakthroughs.',
            a: '**CNN Architecture Evolution Comparison:**\n\n| Architecture | Year | Layers | Parameters | Key Innovation |\n|---|---|---|---|---|\n| LeNet-5 | 1998 | 5 | 60K | First functional CNN for digit recognition |\n| AlexNet | 2012 | 8 | 60M | ReLU, Dropout, GPU training, ImageNet victory |\n| VGG-16 | 2014 | 16 | 138M | Uniform architecture with stacked 3×3 convolutions |\n| GoogLeNet | 2014 | 22 | 5M | Inception modules with parallel branches & 1×1 convs |\n| ResNet-152 | 2015 | 152 | 60M | Residual identity shortcuts (H(x) = F(x) + x) |\n\n**Design Principles Evolution:** Deeper networks achieve higher representational abstraction; bottleneck 1×1 convolutions reduce dimensionality; residual connections eliminate depth limitations.'
          },
        ],
        notes: [
          {
            title: 'CNN Core Insights',
            points: [
              'Formula: Output size = ⌊(W - K + 2P)/S⌋ + 1',
              'Two 3×3 filters = 5×5 receptive field with 28% fewer parameters',
              'ResNet gradient: ∂L/∂x = ∂L/∂H(∂F/∂x + 1) — "+1" ensures gradient flow',
              'Global Average Pooling replaces huge FC layers at network head',
            ]
          },
        ],
        quiz: [
          {
            q: 'What is the primary architectural innovation in ResNet?',
            options: ['Using 7×7 convolutions', 'Skip / Residual identity connections', 'Replacing convolutions with dense layers', 'Sigmoid activation in every layer'],
            answerIndex: 1,
            explanation: 'Residual identity shortcuts (F(x) + x) allow gradient signals to flow unimpeded backward through the network.'
          },
        ],
      },

      // --- UNIT 3 ---
      {
        unitNo: 3,
        title: 'Sequence Modeling & Recurrent Neural Networks (RNNs)',
        topics: ['Recurrent Neural Networks (RNN)', 'Backpropagation Through Time (BPTT)', 'Exploding & Vanishing Gradients in RNNs', 'Long Short-Term Memory (LSTM)', 'Gated Recurrent Unit (GRU)', 'Bidirectional RNNs', 'Sequence-to-Sequence Models'],
        partA: [
          {
            q: 'What is the recurrent state update equation in an RNN?',
            a: 'h_t = tanh(W_hh · h_{t-1} + W_xh · x_t + b_h), and output y_t = softmax(W_hy · h_t + b_y). The hidden state h_t serves as an internal memory capturing sequence context up to time step t.'
          },
          {
            q: 'Explain Backpropagation Through Time (BPTT).',
            a: 'BPTT unrolls the RNN across all T time steps into a feedforward computational graph and applies standard backpropagation, summing weight gradients across all time steps: ∂L/∂W = ∑_{t=1}^T ∂L_t/∂W.'
          },
          {
            q: 'Why do standard RNNs struggle with long-term dependencies?',
            a: 'In BPTT, the gradient contains a product of T Jacobian matrices (∏_{k=t}^T ∂h_k/∂h_{k-1}). If eigenvalues of W_hh are < 1, gradients decay exponentially to 0 (vanishing gradient); if > 1, they explode.'
          },
          {
            q: 'State the roles of the three gates in an LSTM cell.',
            a: '(1) Forget Gate (f_t): decides what information to discard from cell state. (2) Input Gate (i_t): decides which new values to update in cell state. (3) Output Gate (o_t): decides what parts of cell state to output as hidden state.'
          },
          {
            q: 'How does a GRU (Gated Recurrent Unit) simplify the LSTM architecture?',
            a: 'A GRU merges the cell state and hidden state into a single state h_t, and combines the forget and input gates into a single Update Gate (z_t) alongside a Reset Gate (r_t), reducing parameter count by ~25%.'
          },
        ],
        partB: [
          {
            q: 'Explain the complete internal architecture and equations of an LSTM cell.',
            a: '**LSTM Cell Equations:**\n1. **Forget Gate:** f_t = σ(W_f · [h_{t-1}, x_t] + b_f)\n2. **Input Gate:** i_t = σ(W_i · [h_{t-1}, x_t] + b_i)\n3. **Candidate Cell State:** C̃_t = tanh(W_c · [h_{t-1}, x_t] + b_c)\n4. **Cell State Update:** C_t = f_t ⊙ C_{t-1} + i_t ⊙ C̃_t\n5. **Output Gate:** o_t = σ(W_o · [h_{t-1}, x_t] + b_o)\n6. **Hidden State:** h_t = o_t ⊙ tanh(C_t)\n\n*The uninterrupted linear highway C_t = f_t ⊙ C_{t-1} enables gradients to propagate over hundreds of time steps without exponential decay.*'
          },
          {
            q: 'Explain Bidirectional RNNs and Sequence-to-Sequence (Seq2Seq) Encoder-Decoder architecture.',
            a: '**Bidirectional RNN:**\nProcesses input in both directions simultaneously:\n- Forward hidden state: h⃗_t = f(h⃗_{t-1}, x_t)\n- Backward hidden state: h⃖_t = f(h⃖_{t+1}, x_t)\n- Combined representation: h_t = [h⃗_t; h⃖_t]\nCaptures both past and future context.\n\n**Sequence-to-Sequence (Seq2Seq):**\n- **Encoder:** Reads input sequence and compresses it into a context vector c = h_T\n- **Decoder:** Generates output sequence token-by-token conditioned on context vector c and previous generated tokens.'
          },
        ],
        partC: [
          {
            q: 'Compare RNN, LSTM, and GRU in terms of gating mechanisms, computational complexity, memory preservation, and training characteristics.',
            a: '**Comprehensive Sequence Architecture Comparison:**\n\n| Attribute | Vanilla RNN | LSTM | GRU |\n|---|---|---|---|\n| Internal States | 1 (Hidden state h_t) | 2 (Cell state C_t, Hidden h_t) | 1 (Hidden state h_t) |\n| Gates | None | 3 (Forget, Input, Output) | 2 (Reset, Update) |\n| Parameters | W_hh, W_xh | 4 sets of weights | 3 sets of weights |\n| Long-term memory | Very Poor (<10 steps) | Excellent (100+ steps) | Very Good (100+ steps) |\n| Computation Speed | Fastest | Slower | 20-30% faster than LSTM |\n| Gradient Flow | Vanishing/Exploding | Additive cell highway | Gated linear interpolation |\n\n**Gradient Highway in LSTM:** ∂C_t / ∂C_{t-1} = f_t. When f_t ≈ 1, gradient passes unchanged across arbitrary time steps!'
          },
        ],
        notes: [
          {
            title: 'RNN / LSTM Key Insights',
            points: [
              'LSTM Cell highway: C_t = f_t ⊙ C_{t-1} + i_t ⊙ C̃_t',
              'GRU merges cell and hidden state; uses Update and Reset gates',
              'Gradient clipping (e.g. ||g|| > threshold) solves exploding gradients',
            ]
          },
        ],
        quiz: [
          {
            q: 'Which gate in an LSTM cell decides what information is removed from the cell state?',
            options: ['Input Gate', 'Forget Gate', 'Output Gate', 'Reset Gate'],
            answerIndex: 1,
            explanation: 'The Forget Gate (f_t = σ(W_f · [h_{t-1}, x_t] + b_f)) outputs numbers between 0 and 1 deciding what proportion of previous cell state is retained.'
          },
        ],
      },

      // --- UNIT 4 ---
      {
        unitNo: 4,
        title: 'Autoencoders & Generative Models',
        topics: ['Autoencoder Architecture', 'Undercomplete & Overcomplete Autoencoders', 'Denoising Autoencoders', 'Variational Autoencoders (VAE)', 'Reparameterization Trick', 'Generative Adversarial Networks (GANs)', 'Minimax Game in GANs', 'Deep Convolutional GAN (DCGAN)'],
        partA: [
          {
            q: 'What is an Autoencoder and what is its objective function?',
            a: 'An Autoencoder is an unsupervised neural network that reconstructs its input through a low-dimensional bottleneck (latent code z). Loss: L(x, x̂) = ||x - g(f(x))||², where f is encoder and g is decoder.'
          },
          {
            q: 'Differentiate between Undercomplete and Denoising Autoencoders.',
            a: 'Undercomplete autoencoders constrain the latent dimension to be smaller than the input (dim(z) < dim(x)) forcing compression. Denoising autoencoders receive a corrupted input x̃ = x + ϵ and are trained to recover the original clean input x.'
          },
          {
            q: 'What is the Reparameterization Trick in Variational Autoencoders (VAE)?',
            a: 'To allow backpropagation through stochastic latent sampling z ~ N(μ, σ²), the randomness is isolated into an auxiliary noise variable ϵ ~ N(0, I): z = μ + σ ⊙ ϵ. This makes the sampling differentiable with respect to μ and σ.'
          },
          {
            q: 'State the Minimax objective function of Generative Adversarial Networks (GANs).',
            a: 'min_G max_D V(D, G) = E_{x~p_data}[log D(x)] + E_{z~p_z}[log(1 - D(G(z)))]. Discriminator D maximizes probability of correct classification; Generator G minimizes log(1 - D(G(z))).'
          },
          {
            q: 'What is Mode Collapse in GANs?',
            a: 'Mode collapse is a failure mode where the Generator produces only a limited variety of outputs (a single or few modes of the data distribution) that fool the Discriminator, rather than capturing the full diversity of the true dataset.'
          },
        ],
        partB: [
          {
            q: 'Explain the architecture and mathematical formulation of Variational Autoencoders (VAEs). Explain the ELBO loss function.',
            a: '**Variational Autoencoder (VAE) Formulation:**\n- Encoder outputs distribution parameters: mean μ(x) and log-variance log σ²(x)\n- Latent sample: z = μ + σ ⊙ ϵ, where ϵ ~ N(0, I)\n- Decoder reconstructs: x̂ = g(z)\n\n**Loss Function — Evidence Lower Bound (ELBO):**\nL_{VAE} = Reconstruction Loss + KL Divergence\n= ||x - x̂||² + D_{KL}(q_ϕ(z|x) || p(z))\nWhere KL Divergence enforces the latent space to follow a standard Gaussian N(0, I):\nD_{KL} = -1/2 ∑_{j=1}^d (1 + log(σ_j²) - μ_j² - σ_j²)\nEnsures smooth, continuous latent space suitable for interpolation and generation.'
          },
          {
            q: 'Explain the architecture and adversarial training procedure of Generative Adversarial Networks (GANs).',
            a: '**GAN Adversarial Training:**\n- **Generator G(z):** Maps random noise z ~ N(0, I) to synthetic data space G(z)\n- **Discriminator D(x):** Binary classifier outputting probability that x is real data\n\n**Two-Step Training Loop:**\n1. **Train Discriminator:** Maximize log D(x) + log(1 - D(G(z))) with G frozen\n2. **Train Generator:** Minimize log(1 - D(G(z))) (or maximize log D(G(z)) to prevent vanishing gradients early in training) with D frozen\n\nNash equilibrium is reached when D(x) = 0.5 everywhere and p_g = p_data.'
          },
        ],
        partC: [
          {
            q: 'Compare Variational Autoencoders (VAEs) and Generative Adversarial Networks (GANs) on architecture, objective formulation, sample quality, latent space properties, and training stability.',
            a: '**Comprehensive Generative Models Comparison:**\n\n| Attribute | Variational Autoencoder (VAE) | Generative Adversarial Network (GAN) |\n|---|---|---|\n| Framework | Probabilistic graphical model / Autoencoder | Game-theoretic adversarial game (G vs D) |\n| Objective | Maximize ELBO (Reconstruction + KL) | Minimax game V(D, G) |\n| Latent Space | Smooth, structured Gaussian prior N(0, I) | Unstructured noise prior z |\n| Sample Quality | Often slightly blurry (due to L2 loss averaging) | High-fidelity, sharp, photo-realistic |\n| Training Stability | Highly stable (standard gradient descent on ELBO) | Unstable (mode collapse, vanishing gradients) |\n| Density Estimation | Provides tractable lower bound on p(x) | Implicit density model (cannot evaluate p(x)) |\n| Evaluation Metric | ELBO / Reconstruction MSE | Fréchet Inception Distance (FID), Inception Score |'
          },
        ],
        notes: [
          {
            title: 'Generative Models Key Insights',
            points: [
              'VAE loss: Reconstruction MSE + KL divergence to N(0, I)',
              'Reparameterization trick: z = μ + σ ⊙ ϵ makes sampling differentiable',
              'GAN equilibrium: Generator matches data distribution; D(x) = 0.5',
              'DCGAN guidelines: Strided convolutions instead of pooling, Batch Normalization, LeakyReLU',
            ]
          },
        ],
        quiz: [
          {
            q: 'Why is the Reparameterization Trick required in VAEs?',
            options: ['To speed up convolution', 'To allow backpropagation through stochastic latent sampling', 'To prevent overfitting', 'To eliminate the decoder network'],
            answerIndex: 1,
            explanation: 'Standard random sampling has no gradient; z = μ + σ ⊙ ϵ isolates randomness into ϵ, enabling gradients to flow back through μ and σ.'
          },
        ],
      },

      // --- UNIT 5 ---
      {
        unitNo: 5,
        title: 'Transformers, Attention Mechanisms & LLMs',
        topics: ['Self-Attention Mechanism', 'Scaled Dot-Product Attention', 'Multi-Head Attention', 'Transformer Architecture (Encoder-Decoder)', 'Positional Encoding', 'BERT vs GPT', 'Vision Transformers (ViT)', 'Prompt Engineering & Fine-Tuning'],
        partA: [
          {
            q: 'Write the mathematical formula for Scaled Dot-Product Attention.',
            a: 'Attention(Q, K, V) = softmax(Q · Kᵀ / √d_k) · V, where Q is Query matrix, K is Key matrix, V is Value matrix, and d_k is the dimension of the key vectors (scaling factor prevents vanishing gradients in softmax).'
          },
          {
            q: 'Why is the scaling factor 1/√d_k used in Dot-Product Attention?',
            a: 'For large values of d_k, dot products grow large in magnitude, pushing the softmax function into regions with extremely small gradients (saturation). Scaling by 1/√d_k ensures unit variance and maintains stable gradients.'
          },
          {
            q: 'What is the role of Positional Encoding in Transformers?',
            a: 'Because self-attention is permutation-invariant and has no recurrence or convolution, positional encodings (sine and cosine functions of different frequencies) are added to input embeddings to inject token sequence order.'
          },
          {
            q: 'Differentiate BERT and GPT in terms of architecture and pre-training objectives.',
            a: 'BERT is an Encoder-only bidirectional model pre-trained on Masked Language Modeling (MLM) and Next Sentence Prediction (NSP), optimal for classification and understanding. GPT is a Decoder-only autoregressive model pre-trained on causal language modeling (predicting next token), optimal for text generation.'
          },
          {
            q: 'What is Multi-Head Attention and why is it beneficial?',
            a: 'Multi-Head Attention projects Q, K, V into h different lower-dimensional subspaces, applies attention in parallel, and concatenates the outputs: MultiHead(Q,K,V) = Concat(head₁,...,head_h)W^O. It allows the model to attend to information from different representation subspaces simultaneously.'
          },
        ],
        partB: [
          {
            q: 'Explain the complete Transformer Encoder-Decoder architecture with neat block diagram and flow of representations.',
            a: '**Transformer Architecture (Vaswani et al., 2017):**\n\n**Encoder (N=6 layers):**\nEach layer has 2 sub-layers:\n1. Multi-Head Self-Attention + Add & LayerNorm: x + Sublayer(x)\n2. Position-wise Feed-Forward Network (FFN): FFN(x) = max(0, xW₁ + b₁)W₂ + b₂ + Add & LayerNorm\n\n**Decoder (N=6 layers):**\nEach layer has 3 sub-layers:\n1. Masked Multi-Head Self-Attention (prevents positions from attending to future tokens)\n2. Cross-Attention (Queries from decoder, Keys and Values from encoder output)\n3. Position-wise Feed-Forward Network + Add & LayerNorm'
          },
          {
            q: 'Explain Vision Transformers (ViT) and how self-attention is applied to image recognition.',
            a: '**Vision Transformer (ViT) Architecture:**\n1. Divide image (H × W × C) into non-overlapping patches of size P × P (e.g. 16×16)\n2. Number of patches: N = (H·W)/P²\n3. Flatten patches and project linearly into 1D embeddings of dimension D\n4. Prepend a learnable `[CLS]` token (representing whole image classification)\n5. Add 1D learnable positional encodings\n6. Pass through standard Transformer Encoder blocks\n7. Classification head on `[CLS]` token output gives class predictions.'
          },
        ],
        partC: [
          {
            q: 'Provide an in-depth mathematical derivation of Self-Attention, Multi-Head Attention, and Positional Encodings. Explain why Transformers have largely superseded Recurrent Neural Networks in modern AI.',
            a: '**1. Self-Attention Mathematical Formulation:**\nGiven input sequence X ∈ ℝ^{n × d_model}:\n- Q = X · W_Q ∈ ℝ^{n × d_k}\n- K = X · W_K ∈ ℝ^{n × d_k}\n- V = X · W_V ∈ ℝ^{n × d_v}\n- Attention Weights A = softmax(Q · Kᵀ / √d_k) ∈ ℝ^{n × n}\n- Output = A · V ∈ ℝ^{n × d_v}\n\n**2. Multi-Head Attention:**\n- head_i = Attention(Q · W_i^Q, K · W_i^K, V · W_i^V)\n- MultiHead(Q, K, V) = [head_1; head_2; ...; head_h] · W^O\n\n**3. Sinusoidal Positional Encoding:**\n- PE_{(pos, 2i)} = sin(pos / 10000^{2i/d_model})\n- PE_{(pos, 2i+1)} = cos(pos / 10000^{2i/d_model})\nEnables model to attend by relative positions because PE_{pos+k} can be represented as a linear function of PE_{pos}.\n\n**4. Why Transformers Superseded RNNs:**\n| Factor | Recurrent Neural Networks (RNN) | Transformer (Self-Attention) |\n|---|---|---|\n| Computation | Sequential O(n) steps — cannot parallelize | Fully parallel matrix operations O(1) sequential steps |\n| Maximum Path Length | O(n) — signals decay over long spans | O(1) — any two tokens communicate directly |\n| Training Speed | Slow on GPU hardware | Ultra-fast on modern GPU/TPU accelerators |\n| Scaling Laws | Hits performance plateau | Power-law scaling with model size and data (LLMs) |'
          },
        ],
        notes: [
          {
            title: 'Transformer & Attention Essentials',
            points: [
              'Attention formula: softmax(Q · Kᵀ / √d_k) · V',
              'Self-Attention path length is O(1) between any two tokens in sequence',
              'BERT = Encoder-only (bi-directional); GPT = Decoder-only (autoregressive)',
              'ViT treats 16×16 pixel patches as "tokens" for image classification',
            ]
          },
        ],
        quiz: [
          {
            q: 'In the Transformer self-attention formula, what is the purpose of dividing by √d_k?',
            options: ['To ensure integer values', 'To prevent softmax gradients from vanishing due to large magnitudes', 'To invert the matrix', 'To eliminate negative attention'],
            answerIndex: 1,
            explanation: 'For large d_k, dot products grow large, pushing softmax into saturated regions with near-zero gradients. Scaling by 1/√d_k maintains stable unit variance.'
          },
        ],
      },
    ],
  },
]
