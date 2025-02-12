const API_URL ='https://learn.reboot01.com/api/graphql-engine/v1/graphql';
      const AUTH_URL = 'https://learn.reboot01.com/api/auth/signin';
      let jwt = localStorage.getItem('jwt');

      // Check if already logged in
      if (jwt) {
        showProfile();
      }

      async function login() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const credentials = btoa(`${username}:${password}`);

        try {
          const response = await fetch(AUTH_URL, {
            method: 'POST',
            headers: {
              Authorization: `Basic ${credentials}`,
            },
          });

          if (!response.ok) {
            throw new Error('Invalid credentials');
          }

          const data = await response.json();
          jwt = data;
          localStorage.setItem('jwt', jwt);
          showProfile();
        } catch (error) {
          document.getElementById('loginError').textContent = error.message;
        }
      }

      function logout() {
        localStorage.removeItem('jwt');
        location.reload();
      }

      async function fetchGraphQLData(query) {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${jwt}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        });
        return response.json();
      }