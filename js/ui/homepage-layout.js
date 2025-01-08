import { ID, Username } from "../graphql.js"
const nsURI = "http://www.w3.org/2000/svg"

export function createHomepage(totalLevel, totalSkill, totalXp, totalGrade) {
    const homepage = document.createElement('div')
    homepage.classList.add("homepage-container")
    document.body.appendChild(homepage)

    displayHeaderAndFooter(homepage)
    displayProjects(homepage, totalXp, totalSkill)
    displayProgression(homepage, totalLevel)
    displaySkills(homepage, totalSkill)
    displayOther(homepage, totalXp, totalGrade, totalLevel)

}

function displayHeaderAndFooter(homepage) {
    const header = document.createElement('div')
    header.classList.add('header')

    const headerTitle = document.createElement('h1')
    headerTitle.classList.add('header-title')
    headerTitle.innerText = Username + " GraphQL"
    header.appendChild(headerTitle)
    homepage.appendChild(header)
}

function displayProjects(homepage, totalXp, totalSkill) {
    const projectsContainer = document.createElement('div')
    projectsContainer.classList.add('projects-container')
    homepage.appendChild(projectsContainer)

    const projectTitle = document.createElement('h1')
    projectTitle.classList.add('project-title')
    projectTitle.innerText = "Projects"
    projectsContainer.appendChild(projectTitle)

    const projectNames = document.createElement('div')
    projectNames.classList.add('project-names')
    projectsContainer.appendChild(projectNames)

    totalXp["project-xp"].forEach(project => {
        const projectButton = document.createElement('button')
        projectButton.classList.add('project-buttons')
        projectButton.type = "button"
        const projectButtonName = document.createElement('h2')
        projectButtonName.innerHTML = project["projectName"][0].toUpperCase() + project["projectName"].substring(1).replaceAll("-", " ")
        projectButton.appendChild(projectButtonName)

        const projectXpGradeInfo = document.createElement('div')
        projectXpGradeInfo.classList.add('project-xp-grade-info')
        projectButton.appendChild(projectXpGradeInfo)

        const projectButtonXp = document.createElement('h3')
        projectButtonXp.innerHTML = "Xp: " + Math.round(((project["xp"] / 1000) + Number.EPSILON) * 100) / 100 + "kB"
        projectXpGradeInfo.appendChild(projectButtonXp)

        const projectGrade = document.createElement('h3')
        projectGrade.innerHTML = "Grade: " + Math.round(((project["grade"]) + Number.EPSILON) * 100) / 100
        projectXpGradeInfo.appendChild(projectGrade)

        const projectTimeInfo = document.createElement('div')
        projectTimeInfo.classList.add('project-time-info')
        projectButton.appendChild(projectTimeInfo)

        const projectCreated = document.createElement('h3')
        projectCreated.innerHTML = "CreatedAt: " + new Date(project["created"]).toLocaleString()
        projectTimeInfo.appendChild(projectCreated)
        const projectUpdated = document.createElement('h3')
        projectUpdated.innerHTML = "UpdatedAt: " + new Date(project["updated"]).toLocaleString()
        projectTimeInfo.appendChild(projectUpdated)

        const projectInfo = document.createElement('div')
        projectInfo.classList.add('project-skills-info')
        projectButton.appendChild(projectInfo)
        for (let key in totalSkill) {
            if (project.hasOwnProperty(key)) {
                const projectSkill = document.createElement('p')
                projectSkill.innerHTML = key.replace("skill_", "") + ": " + project[key]
                projectInfo.appendChild(projectSkill)
            }
        }
        projectNames.appendChild(projectButton)
        // projectButton.onclick=()=>{
        //     location.href="https://learn.01founders.co/git/jasonasante/"+project["projectName"]
        // }
    })
}

function displayOther(homepage, totalXp, totalGrade, totalLevel) {
    const otherContainer = document.createElement('div')
    otherContainer.classList.add('other-container')
    homepage.appendChild(otherContainer)

    const otherTitle = document.createElement('h1')
    otherTitle.classList.add('other-title')
    otherTitle.innerText = "User Info"
    otherContainer.appendChild(otherTitle)

    const infoContainer = document.createElement('div')
    infoContainer.classList.add('other-info-container')
    otherContainer.appendChild(infoContainer)

    const userId = document.createElement('h2')
    userId.innerHTML = "userId: " + ID
    infoContainer.appendChild(userId)

    const campus = document.createElement('h2')
    campus.innerHTML = "Campus: London"
    infoContainer.appendChild(campus)

    const infoButtonDiv = document.createElement('div')
    infoButtonDiv.classList.add('info-button-container')
    infoContainer.appendChild(infoButtonDiv)

    const infoDiv = document.createElement('div')
    infoDiv.classList.add('info-container')
    infoContainer.appendChild(infoDiv)

    const currentButton = document.createElement('button')
    currentButton.classList.add('current-button')
    currentButton.type = "button"
    currentButton.innerHTML = "Current"
    infoButtonDiv.appendChild(currentButton)

    const xpButton = document.createElement('button')
    xpButton.classList.add('current-button')
    xpButton.type = "button"
    xpButton.innerHTML = "Xp"
    infoButtonDiv.appendChild(xpButton)

    const gradesButton = document.createElement('button')
    gradesButton.classList.add('current-button')
    gradesButton.type = "button"
    gradesButton.innerHTML = "Grade"
    infoButtonDiv.appendChild(gradesButton)

    const levelInfoDiv = document.createElement('div')
    levelInfoDiv.classList.add('level-info')
    infoDiv.appendChild(levelInfoDiv)

    const otherLevelTitle = document.createElement('h1')
    otherLevelTitle.classList.add('other-level-title')
    otherLevelTitle.innerText = "Current"
    levelInfoDiv.appendChild(otherLevelTitle)

    const currentLevel = document.createElement('h2')
    currentLevel.innerHTML = "Current Level: " + totalLevel["current-level"]["amount"]
    levelInfoDiv.appendChild(currentLevel)

    const currentProject = document.createElement('h2')
    let currentProjectArr = totalXp["project-xp"]
        .filter(recentXp => recentXp.projectName === totalLevel["current-level"]["object"]["name"])
    let currentXp = currentProjectArr[0]["xp"]
    let currentGrade = currentProjectArr[0]["grade"]
    currentProject.innerHTML = "Latest Project: " +
        totalLevel["current-level"]["object"]["name"][0].toUpperCase() +
        totalLevel["current-level"]["object"]["name"].substring(1).replaceAll("-", " ")
    levelInfoDiv.appendChild(currentProject)
    const currentProjectXp = document.createElement('h2')
    currentProjectXp.innerHTML = "Current Xp Gained: "
        + Math.round(((currentXp / 1000) + Number.EPSILON) * 100) / 100 + "kB"
    levelInfoDiv.appendChild(currentProjectXp)
    const currentProjectGrade = document.createElement('h2')
    currentProjectGrade.innerHTML = "Current Project Grade: " + Math.round((currentGrade + Number.EPSILON) * 100) / 100
    levelInfoDiv.appendChild(currentProjectGrade)

    const xpInfoDiv = document.createElement('div')
    xpInfoDiv.classList.add('xp-info')
    // infoDiv.appendChild(xpInfoDiv)

    const otherXpTitle = document.createElement('h1')
    otherXpTitle.classList.add('other-xp-title')
    otherXpTitle.innerText = "Xp"
    xpInfoDiv.appendChild(otherXpTitle)

    const totalProjectXp = document.createElement('h2')
    totalProjectXp.innerHTML = "Total Project Xp: " + Math.round(((totalXp["project-total"] / 1000) + Number.EPSILON) * 100) / 100 + "kB"
    xpInfoDiv.appendChild(totalProjectXp)

    const avgProjectXp = document.createElement('h2')
    avgProjectXp.innerHTML = "Avg Project Xp: " + Math.round(((totalXp["avg-project-xp"] / 1000) + Number.EPSILON) * 100) / 100 + "kB"
    xpInfoDiv.appendChild(avgProjectXp)

    const maxProjectXp = document.createElement('h2')
    maxProjectXp.innerHTML = "Maximum Xp: " +
        totalXp["max"]["projectName"][0].toUpperCase() +
        totalXp["max"]["projectName"].substring(1).replaceAll("-", " ") +
        "=>" + Math.round(((totalXp["max"]["xp"] / 1000) + Number.EPSILON) * 100) / 100 + "kB"
    xpInfoDiv.appendChild(maxProjectXp)

    const minProjectXp = document.createElement('h2')
    minProjectXp.innerHTML = "Minimum Xp: " +
        totalXp["min"]["projectName"][0].toUpperCase() +
        totalXp["min"]["projectName"].substring(1).replaceAll("-", " ") +
        "=>" + Math.round(((totalXp["min"]["xp"] / 1000) + Number.EPSILON) * 100) / 100 + "kB"
    xpInfoDiv.appendChild(minProjectXp)

    const gradeInfoDiv = document.createElement('div')
    gradeInfoDiv.classList.add('grade-info')
    // infoDiv.appendChild(gradeInfoDiv)

    const otherGradeTitle = document.createElement('h1')
    otherGradeTitle.classList.add('other-grade-title')
    otherGradeTitle.innerText = "Grades"
    gradeInfoDiv.appendChild(otherGradeTitle)

    const totalProjectGrade = document.createElement('h2')
    totalProjectGrade.innerHTML = "Total Project Grade: " + totalGrade["project-total"]
    gradeInfoDiv.appendChild(totalProjectGrade)

    const avgProjectGrade = document.createElement('h2')
    avgProjectGrade.innerHTML = "Avg Project Grade: " +
        Math.round(((totalGrade["project-total"] / totalGrade["project-grades"].length)
            + Number.EPSILON) * 100) / 100
    gradeInfoDiv.appendChild(avgProjectGrade)

    const maxGradeProject = document.createElement('h2')
    maxGradeProject.innerHTML = "Maximum Grade: " +
        totalGrade["max"]["projectName"][0].toUpperCase() +
        totalGrade["max"]["projectName"].substring(1).replaceAll("-", " ") +
        "=>" + Math.round(((totalGrade["max"]["grade"]) + Number.EPSILON) * 100) / 100
    gradeInfoDiv.appendChild(maxGradeProject)

    const minGradeProject = document.createElement('h2')
    minGradeProject.innerHTML = "Minimum Grade: " +
        totalGrade["min"]["projectName"][0].toUpperCase() +
        totalGrade["min"]["projectName"].substring(1).replaceAll("-", " ") +
        "=>" + Math.round(((totalGrade["min"]["grade"]) + Number.EPSILON) * 100) / 100
    gradeInfoDiv.appendChild(minGradeProject)

    xpButton.onclick = () => {
        infoDiv.firstChild.remove()
        infoDiv.appendChild(xpInfoDiv)
    }
    currentButton.onclick = () => {
        infoDiv.firstChild.remove()
        infoDiv.appendChild(levelInfoDiv)
    }
    gradesButton.onclick = () => {
        infoDiv.firstChild.remove()
        infoDiv.appendChild(gradeInfoDiv)
    }
}

function displaySkills(homepage, totalSkill) {
    const skillsContainer = document.createElement('div')
    skillsContainer.classList.add('skills-container')
    homepage.appendChild(skillsContainer)

    const skillsTitle = document.createElement('h1')
    skillsTitle.classList.add('skills-title')
    skillsTitle.innerText = " Skills"
    skillsContainer.appendChild(skillsTitle)

    const ChartContainer = document.createElement('div')
    ChartContainer.classList.add('svg-chart')
    skillsContainer.appendChild(ChartContainer)

    const pieChartContainer = document.createElement('div')
    pieChartContainer.classList.add('svg-pie-chart')
    ChartContainer.appendChild(pieChartContainer)

    const colorContainer = document.createElement('div')
    colorContainer.classList.add('svg-pie-chart-color')
    ChartContainer.appendChild(colorContainer)

    const pieChart = document.createElementNS(nsURI, 'svg')
    pieChart.setAttributeNS(null, "viewBox", "0 0 20 20")
    pieChartContainer.appendChild(pieChart)


    const r = 10
    const circum = Math.round((Math.PI * r + Number.EPSILON) * 100) / 100

    // const mainCircle = document.createElementNS(nsURI, 'circle')
    // mainCircle.setAttributeNS(null, "r", r)
    // mainCircle.setAttributeNS(null, "cx", r)
    // mainCircle.setAttributeNS(null, "cy", r)
    // mainCircle.setAttributeNS(null, "fill", "white")
    // pieChart.appendChild(mainCircle)

    let colorArr = []
    let counter = 0
    let offset = [0]
    for (let key in totalSkill) {
        if (key != 'total') {
            colorArr.push({ skill: key, amount: totalSkill[key], color: randomColour() })
        }
    }

    colorArr.forEach(skill => {
        let percent = getPercentageValue(skill["amount"], totalSkill)
        const fraction = document.createElementNS(nsURI, 'circle')
        fraction.setAttributeNS(null, "class", skill["skill"])
        fraction.setAttributeNS(null, "r", r / 2)
        fraction.setAttributeNS(null, "cx", r)
        fraction.setAttributeNS(null, "cy", r)
        fraction.setAttributeNS(null, "fill", "transparent")
        fraction.setAttributeNS(null, "stroke", skill["color"])
        fraction.setAttributeNS(null, "stroke-width", r)
        fraction.setAttributeNS(null, "stroke-dasharray", (percent * circum) / 100 + " " + circum)
        fraction.setAttributeNS(null, "stroke-dashoffset", -offset[counter])
        fraction.setAttributeNS(null, "transform", "rotate(-90) translate(-20)")
        offset.push(offset[counter] + (percent * circum) / 100)
        counter++
        pieChart.appendChild(fraction)

        const skillColor = document.createElement('p')
        skillColor.innerHTML = skill["skill"].replace("skill_", "") + ":= " + skill["amount"]
        skillColor.style.color = skill["color"]
        colorContainer.appendChild(skillColor)

        skillColor.addEventListener("mouseenter", () => {
            skillColor.style.textShadow = "1px 1px 1px #fff, 1px 1px 1px #ccc"
            fraction.setAttributeNS(null, "stroke", "#ccc")
        })

        skillColor.addEventListener("mouseleave", function () {
            skillColor.style.textShadow = "none"
            fraction.setAttributeNS(null, "stroke", skill["color"])
        });

    })


}

function getPercentageValue(amount, object) {
    return Math.round(((amount / object.total) + Number.EPSILON) * 100)
}

function randomColour() {
    return `rgb(${Math.round(Math.random() * 255)}, ${Math.round(Math.random() * 255)}, ${Math.round(Math.random() * 255)})`
}


function displayProgression(homepage, totalLevel) {
    const lineGraphsContainer = document.createElement('div')
    lineGraphsContainer.classList.add('line-graphs-container')
    homepage.appendChild(lineGraphsContainer)

    const ProgressionTitle = document.createElement('h1')
    ProgressionTitle.classList.add('line-graph-title')
    ProgressionTitle.innerText = " Progression"
    lineGraphsContainer.appendChild(ProgressionTitle)

    const select = document.createElement('select')
    select.classList.add('graph-display-name')
    lineGraphsContainer.appendChild(select)

    const jsOption = document.createElement('option')
    jsOption.value = "js"
    select.setAttribute("data-default", jsOption.value)
    jsOption.innerText = "Javascript"
    select.appendChild(jsOption)

    const goOption = document.createElement('option')
    goOption.value = "go-projects"
    goOption.innerText = "Go"
    select.appendChild(goOption)

    const graphsContainer = document.createElement('div')
    graphsContainer.classList.add('graph-container')
    lineGraphsContainer.appendChild(graphsContainer)

    const lineGraph = document.createElementNS(nsURI, 'svg')
    lineGraph.classList.add('graph')
    lineGraph.setAttributeNS(null, "viewBox", "70 0 500 200")
    graphsContainer.appendChild(lineGraph)

    const xAxisMin = 90
    const xAxisMax = 600
    const xAxisOffset = 10

    const yAxisMin = 150
    const yAxisMax = 0
    const yAxisOffset = 10

    // y-axis
    const xGrid = document.createElementNS(nsURI, "g")
    xGrid.classList.add('grid')
    xGrid.classList.add('x-grid')
    xGrid.setAttributeNS(null, "id", "xGrid")
    lineGraph.appendChild(xGrid)

    const yAxis = document.createElementNS(nsURI, "line")
    yAxis.setAttributeNS(null, "x1", xAxisMin)
    yAxis.setAttributeNS(null, "x2", xAxisMin)
    yAxis.setAttributeNS(null, "y1", yAxisMin)
    yAxis.setAttributeNS(null, "y2", yAxisMax)
    xGrid.appendChild(yAxis)

    // x-axis
    const yGrid = document.createElementNS(nsURI, "g")
    yGrid.classList.add('grid')
    yGrid.classList.add('y-grid')
    yGrid.setAttributeNS(null, "id", "yGrid")
    lineGraph.appendChild(yGrid)

    const xAxis = document.createElementNS(nsURI, "line")
    xAxis.setAttributeNS(null, "x1", xAxisMin)
    xAxis.setAttributeNS(null, "x2", xAxisMax)
    xAxis.setAttributeNS(null, "y1", yAxisMin)
    xAxis.setAttributeNS(null, "y2", yAxisMin)
    xGrid.appendChild(xAxis)

    createLineGraph(lineGraph, xAxisMin, xAxisMax, xAxisOffset, yAxisMin, yAxisMax, yAxisOffset, totalLevel, select.dataset)
    select.onchange = (evt) => {
        document.querySelector('.line').remove()
        document.querySelectorAll('.labels').forEach(labels => labels.remove())
        createLineGraph(lineGraph, xAxisMin, xAxisMax, xAxisOffset, yAxisMin, yAxisMax, yAxisOffset, totalLevel, evt.target.value)
    }
}

function createLineGraph(lineGraph, xAxisMin, xAxisMax, xAxisOffset, yAxisMin, yAxisMax, yAxisOffset, totalLevel, language) {
    let projectArr = []
    if (language == "go-projects") {
        projectArr = totalLevel[language]
    } else {
        projectArr = totalLevel["piscine-js"].concat(totalLevel["js-projects"]).sort((a, b) => { return new Date(b[1]) - new Date(a[1]) })
    }

    //y-axis label
    const yLabelNum = 5
    let yAxisCeiling = Math.ceil(projectArr[projectArr.length - 1]["amount"] / yLabelNum) * yLabelNum
    const yLabelDiff = yAxisCeiling / yLabelNum

    const yLabels = document.createElementNS(nsURI, "g")
    yLabels.classList.add('labels')
    yLabels.classList.add('y-labels')
    lineGraph.appendChild(yLabels)

    const yLabelName = document.createElementNS(nsURI, "text")
    yLabelName.setAttributeNS(null, "x", xAxisMin - (4 * xAxisOffset))
    yLabelName.setAttributeNS(null, "y", (yAxisMin / 2))
    yLabelName.innerHTML = "LEVEL"
    yLabels.appendChild(yLabelName)

    const yLabelGaps = Math.round(yAxisMin / (yAxisCeiling / yLabelDiff))

    for (let y = 0; y <= yAxisCeiling / yLabelDiff; y++) {
        const yLabelText = document.createElementNS(nsURI, "text")
        yLabelText.setAttributeNS(null, "x", xAxisMin - xAxisOffset)
        yLabelText.setAttributeNS(null, "y", (y * yLabelGaps) + yAxisOffset)
        yLabelText.innerHTML = (yLabelDiff) * (yLabelNum - y)
        yLabels.appendChild(yLabelText)
    }

    const numberOfmonths = monthDiff(projectArr[0]["createdAt"], projectArr[projectArr.length - 1]["createdAt"])
    let startMonth = new Date(projectArr[0]["createdAt"]).getMonth()
    let startYear = new Date(projectArr[0]["createdAt"]).getFullYear()

    const xLabelGaps = (xAxisMax - xAxisMin) / numberOfmonths
    const xLabels = document.createElementNS(nsURI, "g")
    xLabels.classList.add('labels')
    xLabels.classList.add('x-labels')
    lineGraph.appendChild(xLabels)

    for (let m = 0; m <= numberOfmonths; m++) {
        let month = startMonth + m
        let year = startYear
        if (month > 11) {
            month = month - 12
            year++
        }

        let monthName = new Date(year, month, 1).toLocaleString('default', { month: 'short' })
        let shortYear = new Date(year, month, 1).getFullYear().toString().substr(-2)

        const xLabelText = document.createElementNS(nsURI, "text")
        xLabelText.setAttributeNS(null, "x", (m * xLabelGaps) + xAxisMin)
        xLabelText.setAttributeNS(null, "y", yAxisMin + (3 * yAxisOffset))
        xLabelText.innerHTML = monthName + " " + shortYear
        xLabels.appendChild(xLabelText)
    }

    const yLevelUnit = yAxisMin / yAxisCeiling

    const line = document.createElementNS(nsURI, "polyline")
    line.setAttributeNS(null, "fill", "none")
    line.setAttributeNS(null, "stroke", "orange")
    line.setAttributeNS(null, "stroke-width", 1.5)
    let points = ""
    projectArr.forEach(level => {
        const monthUnit = new Date(new Date(level["createdAt"]).getFullYear(), new Date(level["createdAt"]).getMonth(), 0).getDate() / 85
        let xCoord = 0
        let yCoord = yAxisMin - (level["amount"] * yLevelUnit)
        if (new Date(level["createdAt"]).getMonth() >= startMonth) {
            xCoord =
                // get starting coordinate of respective month
                ((new Date(level["createdAt"]).getMonth() - startMonth) * xLabelGaps) + xAxisMin
                // plus the positioning of date in that month
                + (new Date(new Date(level["createdAt"])).getDate() * monthUnit)

        } else {
            xCoord =
                // get starting coordinate of respective month
                ((new Date(level["createdAt"]).getMonth() + (12 - startMonth)) * xLabelGaps) + xAxisMin
                // plus the positioning of date in that month
                + (new Date(new Date(level["createdAt"])).getDate() * monthUnit)
            points += xCoord.toString() + "," + yCoord.toString() + " "
        }
        points += xCoord.toString() + "," + yCoord.toString() + " "
    })
    line.setAttributeNS(null, "points", points)
    line.classList.add('line')
    lineGraph.appendChild(line)
}

function monthDiff(d1, d2) {
    var months;
    months = (new Date(d2).getFullYear() - new Date(d1).getFullYear()) * 12;
    months -= new Date(d1).getMonth();
    months += new Date(d2).getMonth();
    return months <= 0 ? 0 : months;
}