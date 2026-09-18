import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateBody, createLabActivitySchema, updateLabActivitySchema } from '@/lib/validations/apiValidation'

export const dynamic = 'force-dynamic'

const DEFAULT_AI_DS_LAB_PRESETS = [
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

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'faculty' && session.role !== 'admin' && session.role !== 'super_admin')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Find faculty record
    let faculty = await prisma.faculty.findUnique({
      where: { userId: session.userId },
    }).catch(() => null)

    if (!faculty && session.facultyId) {
      faculty = await prisma.faculty.findUnique({
        where: { facultyId: session.facultyId },
      }).catch(() => null)
    }

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

    // Fetch day-wise activities
    const activities = faculty?.id ? await prisma.labDayActivity.findMany({
      where: { facultyId: faculty.id },
      orderBy: { date: 'desc' },
    }).catch(() => []) : []

    return NextResponse.json({
      success: true,
      labDetails: {
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
      },
      activities,
      presets: DEFAULT_AI_DS_LAB_PRESETS,
    })
  } catch (error: any) {
    console.error('Fetch lab activities error:', error)
    return NextResponse.json({ success: false, message: error.message || 'Internal error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'faculty' && session.role !== 'admin' && session.role !== 'super_admin')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    let faculty = await prisma.faculty.findUnique({
      where: { userId: session.userId },
    }).catch(() => null)

    if (!faculty && session.facultyId) {
      faculty = await prisma.faculty.findUnique({
        where: { facultyId: session.facultyId },
      }).catch(() => null)
    }

    if (!faculty) {
      return NextResponse.json({ success: false, message: 'Faculty record not found' }, { status: 404 })
    }

    const rawJson = await request.json()
    const parsed = validateBody(createLabActivitySchema, rawJson)
    if (!parsed.success) return parsed.response
    const body = parsed.data
    const {
      labName,
      labCode,
      year,
      semester,
      section,
      batch,
      day,
      date,
      period,
      experimentNo,
      experimentName,
      topicsCovered,
      activityType = 'Lab Experiment',
      labTrainer,
      toolsUsed,
      status = 'completed',
      attendanceCount,
      remarks,
    } = body

    const newActivity = await prisma.labDayActivity.create({
      data: {
        facultyId: faculty.id,
        facultyName: session.name || null,
        labName: labName || 'AI & DS Practical Laboratory',
        labCode: labCode || null,
        year: year ? Number(year) : (faculty.advisorYear || 2),
        semester: semester ? Number(semester) : (faculty.advisorSem || 3),
        section: section ? String(section).toUpperCase() : (faculty.advisorSec || 'B'),
        batch: batch || faculty.advisorBatch || null,
        day: day || new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
        date: String(date),
        period: period || faculty.classPeriod || null,
        experimentNo: experimentNo ? Number(experimentNo) : null,
        experimentName: String(experimentName).trim(),
        topicsCovered: String(topicsCovered).trim(),
        activityType: activityType || 'Lab Experiment',
        labTrainer: labTrainer || (faculty as any).labTrainer || null,
        toolsUsed: toolsUsed || null,
        status: status || 'completed',
        attendanceCount: attendanceCount ? Number(attendanceCount) : null,
        remarks: remarks || null,
      },
    })

    return NextResponse.json({ success: true, activity: newActivity })
  } catch (error: any) {
    console.error('Create lab activity error:', error)
    return NextResponse.json({ success: false, message: error.message || 'Internal error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'faculty' && session.role !== 'admin' && session.role !== 'super_admin')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const rawJson = await request.json()
    const parsed = validateBody(updateLabActivitySchema, rawJson)
    if (!parsed.success) return parsed.response
    const body = parsed.data
    const { id, ...updates } = body

    const existing = await prisma.labDayActivity.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Activity not found' }, { status: 404 })
    }

    if (session.role !== 'admin' && session.role !== 'super_admin') {
      const faculty = await prisma.faculty.findFirst({
        where: {
          OR: [
            { userId: session.userId },
            ...(session.facultyId ? [{ facultyId: session.facultyId }] : []),
          ],
        },
      })
      if (!faculty || existing.facultyId !== faculty.id) {
        return NextResponse.json({ success: false, message: 'Forbidden. You do not own this lab activity.' }, { status: 403 })
      }
    }

    const updated = await prisma.labDayActivity.update({
      where: { id },
      data: {
        ...(updates.labName ? { labName: updates.labName } : {}),
        ...(updates.labCode ? { labCode: updates.labCode } : {}),
        ...(updates.day ? { day: updates.day } : {}),
        ...(updates.date ? { date: updates.date } : {}),
        ...(updates.period ? { period: updates.period } : {}),
        ...(updates.experimentNo !== undefined ? { experimentNo: updates.experimentNo ? Number(updates.experimentNo) : null } : {}),
        ...(updates.experimentName ? { experimentName: updates.experimentName } : {}),
        ...(updates.topicsCovered ? { topicsCovered: updates.topicsCovered } : {}),
        ...(updates.activityType ? { activityType: updates.activityType } : {}),
        ...(updates.labTrainer !== undefined ? { labTrainer: updates.labTrainer } : {}),
        ...(updates.toolsUsed !== undefined ? { toolsUsed: updates.toolsUsed } : {}),
        ...(updates.status ? { status: updates.status } : {}),
        ...(updates.attendanceCount !== undefined ? { attendanceCount: updates.attendanceCount ? Number(updates.attendanceCount) : null } : {}),
        ...(updates.remarks !== undefined ? { remarks: updates.remarks } : {}),
      },
    })

    return NextResponse.json({ success: true, activity: updated })
  } catch (error: any) {
    console.error('Update lab activity error:', error)
    return NextResponse.json({ success: false, message: error.message || 'Internal error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'faculty' && session.role !== 'admin' && session.role !== 'super_admin')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 })
    }

    const existing = await prisma.labDayActivity.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Activity not found' }, { status: 404 })
    }

    if (session.role !== 'admin' && session.role !== 'super_admin') {
      const faculty = await prisma.faculty.findFirst({
        where: {
          OR: [
            { userId: session.userId },
            ...(session.facultyId ? [{ facultyId: session.facultyId }] : []),
          ],
        },
      })
      if (!faculty || existing.facultyId !== faculty.id) {
        return NextResponse.json({ success: false, message: 'Forbidden. You do not own this lab activity.' }, { status: 403 })
      }
    }

    await prisma.labDayActivity.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete lab activity error:', error)
    return NextResponse.json({ success: false, message: error.message || 'Internal error' }, { status: 500 })
  }
}
