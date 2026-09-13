import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { requireRoleSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortalLayout } from '@/components/layout/PortalLayout'
import { FacultyLaboratoryView, LabDetails, LabPreset, LabActivityRecord } from './components/FacultyLaboratoryView'

export const dynamic = 'force-dynamic'

const DEFAULT_AI_DS_LAB_PRESETS: LabPreset[] = [
  {
    experimentNo: 1,
    name: 'Introduction to Python for Data Science & Environment Setup',
    topics: 'Setting up Jupyter Lab, VS Code, Anaconda distribution. Working with basic NumPy arrays, broadcasting, vectorization, and matrix operations. Hands-on debugging of Python numerical scripts.',
    activityType: 'Hands-on Activity',
    tools: 'Python 3.11, Jupyter Lab, NumPy',
  },
  {
    experimentNo: 2,
    name: 'Data Manipulation, Cleaning & Transformation with Pandas',
    topics: 'Importing CSV, Excel, JSON datasets. Handling missing/null values, outlier detection, data filtering, multi-index aggregation, and groupby operations on real-world datasets.',
    activityType: 'Lab Experiment',
    tools: 'Pandas, Python, Jupyter Notebook',
  },
  {
    experimentNo: 3,
    name: 'Exploratory Data Analysis (EDA) & Data Visualization',
    topics: 'Univariate, bivariate, and multivariate analysis. Visualizing statistical distributions using Matplotlib and Seaborn (boxplots, heatmaps, pairplots, correlation matrices).',
    activityType: 'Lab Experiment',
    tools: 'Matplotlib, Seaborn, Pandas',
  },
  {
    experimentNo: 4,
    name: 'Implementation of Uninformed & Informed Search Algorithms',
    topics: 'Practical implementation of Breadth First Search (BFS), Depth First Search (DFS), and A* heuristic search on 8-puzzle and Romania graph pathfinding problems.',
    activityType: 'Lab Experiment',
    tools: 'Python, NetworkX, Graphviz',
  },
  {
    experimentNo: 5,
    name: 'Constraint Satisfaction & Adversarial Search (Minimax with Alpha-Beta)',
    topics: 'Solving N-Queens constraint problem using backtracking. Implementing Minimax algorithm with Alpha-Beta pruning for Tic-Tac-Toe / Connect-4 game playing agent.',
    activityType: 'Lab Experiment',
    tools: 'Python 3.11, VS Code',
  },
  {
    experimentNo: 6,
    name: 'Supervised Learning: Linear & Logistic Regression Analysis',
    topics: 'Data normalization, train-test splitting, fitting Linear and Logistic regression models from scratch and via Scikit-Learn. Evaluating MSE, RMSE, R-squared, Precision, Recall, and ROC-AUC.',
    activityType: 'Lab Experiment',
    tools: 'Scikit-Learn, NumPy, Matplotlib',
  },
  {
    experimentNo: 7,
    name: 'Decision Trees, Random Forest & Ensemble Classifiers',
    topics: 'Constructing ID3/CART decision trees with Gini Impurity and Information Gain. Hyperparameter tuning using GridSearchCV. Implementing Random Forest classifier and evaluating confusion matrix.',
    activityType: 'Lab Experiment',
    tools: 'Scikit-Learn, Seaborn, Python',
  },
  {
    experimentNo: 8,
    name: 'Unsupervised Learning: K-Means Clustering & PCA Dimensionality Reduction',
    topics: 'Implementing K-Means clustering with Elbow method and Silhouette score. Applying Principal Component Analysis (PCA) for 2D/3D feature reduction and visualization.',
    activityType: 'Lab Experiment',
    tools: 'Scikit-Learn, Matplotlib 3D, Pandas',
  },
  {
    experimentNo: 9,
    name: 'Model Practical Examination & Viva-Voce Evaluation',
    topics: 'Comprehensive practical assessment on end-to-end Machine Learning pipeline. Viva-voce questions on algorithms, hyperparameter tuning, model evaluation metrics, and lab record verification.',
    activityType: 'Model Practical',
    tools: 'Jupyter Lab, Python, Lab Manual',
  },
  {
    experimentNo: 10,
    name: 'Capstone Mini-Project Review & Demonstration',
    topics: 'Team-based demonstration of end-to-end Data Science / AI application with live inference, UI dashboard, documentation review, and peer code evaluation.',
    activityType: 'Project Review',
    tools: 'Streamlit / Flask, GitHub, Scikit-Learn',
  },
]

export default async function FacultyLaboratoryPage() {
  const session = await requireRoleSession(['faculty'])

  const cookieStore = cookies()
  const rawLoginRole = cookieStore.get('portal_login_role')?.value || 'faculty'

  // If user logged in under Class Advisor mode, redirect to faculty dashboard (advisors don't manage lab sessions)
  if (rawLoginRole === 'advisor') {
    redirect('/faculty-dashboard')
  }

  let faculty = await prisma.faculty.findUnique({
    where: { userId: session.userId },
  }).catch(() => null)

  if (!faculty && session.facultyId) {
    faculty = await prisma.faculty.findUnique({
      where: { facultyId: session.facultyId },
    }).catch(() => null)
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  }).catch(() => null)

  // Extract Lab Details
  let labName = 'Artificial Intelligence & Data Science Laboratory'
  let labCode = 'AD2311'
  let labTimings = '01:20 PM - 04:30 PM'
  let labDay = 'Wednesday, Thursday'
  let labPeriod = 'Period 5 - 8'
  const labTrainer = (faculty as any)?.labTrainer || 'Designated Lab Instructor'

  if (faculty?.subjectName?.includes(' | ')) {
    const parts = faculty.subjectName.split(' | ')
    labName = parts[1]?.trim() || labName
  } else if (faculty?.subjectName && faculty.subjectName.toLowerCase().includes('lab')) {
    labName = faculty.subjectName
  }

  if (faculty?.classTime?.includes(' | ')) {
    const parts = faculty.classTime.split(' | ')
    labTimings = parts[1]?.trim() || labTimings
  }
  if (faculty?.classDay?.includes(' | ')) {
    const parts = faculty.classDay.split(' | ')
    labDay = parts[1]?.trim() || labDay
  }
  if (faculty?.classPeriod?.includes(' | ')) {
    const parts = faculty.classPeriod.split(' | ')
    labPeriod = parts[1]?.trim() || labPeriod
  }

  let subjectsArr: string[] = []
  if (faculty?.subjects) {
    try {
      subjectsArr = JSON.parse(faculty.subjects)
      if (subjectsArr.length >= 2) {
        labCode = subjectsArr[1]
      } else if (subjectsArr.length === 1 && subjectsArr[0].toLowerCase().includes('lab')) {
        labCode = subjectsArr[0]
      }
    } catch {}
  }

  const batch = faculty?.advisorBatch || (faculty?.advisorYear ? `Year ${faculty.advisorYear} - Sem ${faculty.advisorSem || 3} - Sec ${faculty.advisorSec || 'B'}` : 'Year 2 - Sem 3 - Sec B')

  const initialDetails: LabDetails = {
    labName,
    labCode,
    labTimings,
    labDay,
    labPeriod,
    labTrainer,
    batch,
    year: faculty?.advisorYear || 2,
    semester: faculty?.advisorSem || 3,
    section: faculty?.advisorSec || 'B',
  }

  // Fetch logged activities
  const rawActivities = faculty?.id ? await prisma.labDayActivity.findMany({
    where: { facultyId: faculty.id },
    orderBy: { date: 'desc' },
  }).catch(() => []) : []

  const formattedActivities: LabActivityRecord[] = rawActivities.map((a) => ({
    id: a.id,
    facultyId: a.facultyId,
    facultyName: a.facultyName,
    labName: a.labName,
    labCode: a.labCode,
    year: a.year,
    semester: a.semester,
    section: a.section,
    batch: a.batch,
    day: a.day,
    date: a.date,
    period: a.period,
    experimentNo: a.experimentNo,
    experimentName: a.experimentName,
    topicsCovered: a.topicsCovered,
    activityType: a.activityType,
    labTrainer: a.labTrainer,
    toolsUsed: a.toolsUsed,
    status: a.status,
    attendanceCount: a.attendanceCount,
    remarks: a.remarks,
    createdAt: a.createdAt.toISOString(),
  }))

  return (
    <PortalLayout
      role="faculty"
      userName={user?.name || session.name || 'Faculty Member'}
      userEmail={user?.email || session.email}
      roleBadgeLabel={faculty?.facultyType === 'lab_faculty' ? 'Lab Handler' : 'Faculty Member'}
      isAdvisor={false}
    >
      <div className="py-2 animate-fade-in">
        <FacultyLaboratoryView
          initialDetails={initialDetails}
          initialActivities={formattedActivities}
          presets={DEFAULT_AI_DS_LAB_PRESETS}
          facultyName={user?.name || session.name || 'Faculty Member'}
        />
      </div>
    </PortalLayout>
  )
}
