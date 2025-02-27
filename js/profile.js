// وظيفة لعرض الملف الشخصي
async function showProfile() {
    // Hide login and show profile container
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('profileContainer').style.display = 'block';

    // GraphQL query to fetch user data including
    const query = `
        query {
          user {
            id
            login
            firstName
            lastName
            totalUp
            totalDown
            auditRatio
            progresses(order_by: {updatedAt: desc}) {
                path
                createdAt
                grade
                group {
                    captainLogin
                    auditors {
                        auditorLogin
                    }
                }
            }
            audits {
                group {
                    captainLogin
                    auditors {
                        endAt
                    }
                }
                grade
            }
            transactions(where: {type: {_eq: "xp"}, eventId: {_is_null: false}}, order_by: {createdAt: asc}) {
                amount
                createdAt
                path
            }
            skills: transactions(where: {type: {_like: "%skill_%"}}, order_by: {id: asc}) {
                amount
                type
            }
        }
    }
    `;

    try {
        const data = await fetchGraphQLData(query);
        const user = data.data.user[0];

        // Create basic info container if it doesn't exist
        if (!document.getElementById('basicInfo')) {
            const basicInfoDiv = document.createElement('div');
            basicInfoDiv.id = 'basicInfo';
            document.querySelector('.profile-container').insertBefore(basicInfoDiv, document.querySelector('.graphs-container'));
        }

        // Calculate audit ratio and total XP
        const auditRatio = user.totalUp / user.totalDown || 0;
        const totalXP = ((user.totalUp - user.totalDown) / 1000) - 64;

        // Display basic user information in a table format
        document.getElementById('basicInfo').innerHTML = `
            <div class="welcome-message">Welcome, ${user.firstName} ${user.lastName}!</div>
            <table class="user-info-table">
                <tr>
                    <td><strong>ID:</strong></td>
                    <td>${user.id}</td>
                </tr>
                <tr>
                    <td><strong>Audit Ratio:</strong></td>
                    <td>
                        <div class="audit-ratio-container">
                            <span class="audit-ratio-text">${auditRatio.toFixed(1)}</span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td><strong>Full Name:</strong></td>
                    <td>${user.firstName} ${user.lastName}</td>
                </tr>
                <tr>
                    <td><strong>Username:</strong></td>
                    <td>${user.login}</td>
                </tr>
                <tr>
                    <td><strong>Campus:</strong></td>
                    <td>Bahrain</td>
                </tr>
                <tr>
                    <td><strong>Last Project:</strong></td>
                    <td>${user.progresses[0] ? `${user.progresses[0].path} (${new Date(user.progresses[0].createdAt).toLocaleString()})` : 'No projects yet'}</td>
                </tr>
                <tr>
                    <td><strong>Total XP:</strong></td>
                    <td>${Math.round(totalXP)} kB</td>
                </tr>
            </table>
        `;

        // Generate visual representations of user data
        drawXPGraph(user.transactions);
        drawAuditPieChart(user.totalUp, user.totalDown);
        drawSkillsGraph(user.skills);

        // Display progress information in table format
        displayProgressTable(user.progresses);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
