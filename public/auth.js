const signupForm = document.getElementById('signup-form');
const errorMessage = document.getElementById('error-message');
const birthdateInput = document.getElementById('birthdate');
const agePreview = document.getElementById('age-preview');
const passwordInput = document.getElementById('password');
const passwordToggle = document.getElementById('password-toggle');

// Calculate age from a birthdate
function calculateAge(birthdateString) {
  const today = new Date();
  const birthDate = new Date(birthdateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Show live age preview as the user picks a date
if (birthdateInput) {
  birthdateInput.addEventListener('change', () => {
    if (birthdateInput.value) {
      const age = calculateAge(birthdateInput.value);
      agePreview.textContent = age >= 0 ? `Age: ${age}` : '';
    }
  });
}

// Password show/hide toggle
if (passwordToggle) {
  passwordToggle.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    passwordToggle.classList.toggle('fa-eye');
    passwordToggle.classList.toggle('fa-eye-slash');
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const birthdate = document.getElementById('birthdate').value;
    const age = calculateAge(birthdate);
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const submitBtn = signupForm.querySelector('button');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    try {
      const response = await fetch('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, age, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        errorMessage.textContent = data.error;
        errorMessage.classList.add('show');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Sign Up <i class="fa-solid fa-arrow-right"></i>';
        return;
      }

      alert('Account created successfully! Please log in.');
      window.location.href = 'login.html';

    } catch (err) {
      console.error('Signup request failed:', err);
      errorMessage.textContent = 'Could not connect to the server. Please try again.';
      errorMessage.classList.add('show');
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Sign Up <i class="fa-solid fa-arrow-right"></i>';
    }
  });
}