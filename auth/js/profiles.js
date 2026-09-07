(() => {
  const $ = id => document.getElementById(id);
  const tableByRole = {
    trainee: 'trainees',
    provider: 'training_providers',
    employer: 'employers'
  };

  // These fields match the shared 17-table schema used by the modules.
  // Auth email is taken from Supabase Auth and is not treated as user-editable identity data.
  const fieldMap = {
    trainee: {
      full_name: 'full_name',
      date_of_birth: 'date_of_birth',
      phone: 'phone',
      gender: 'gender',
      district: 'district',
      city: 'city',
      state: 'state',
      preferred_language: 'preferred_language',
      education_level: 'education_level',
      employment_status: 'employment_status',
      consent_given: 'consent_given',
      consent_date: 'consent_date'
    },
    provider: {
      organization_name: 'organization_name',
      provider_type: 'provider_type',
      email: 'email',
      phone: 'phone',
      address: 'address',
      district: 'district',
      city: 'city'
    },
    employer: {
      name: 'name',
      industry: 'industry',
      location: 'location',
      contact_person: 'contact_person',
      contact_email: 'contact_email',
      phone: 'phone',
      description: 'description'
    }
  };

  function msg(text, type = 'info') {
    const el = $('profile-message');
    if (!el) return;
    el.textContent = text;
    el.className = `profile-message ${type}`;
  }

  function value(id) {
    const el = $(id);
    return el ? (el.value || '').trim() : '';
  }

  function set(id, v) {
    const el = $(id);
    if (el) {
      if (el.type === 'checkbox') el.checked = Boolean(v);
      else el.value = v ?? '';
    }
  }

  async function getSession() {
    const { data, error } = await window.supabaseClient.auth.getSession();
    if (error) throw error;
    if (!data.session) throw new Error('Your session has expired. Please sign in again.');
    return data.session;
  }

  async function loadRole(role) {
    const session = await getSession();

    if (role === 'admin') {
      // Admin profile data lives in Auth user_metadata; authorization itself is app_metadata.
      const m = session.user.user_metadata || {};
      set('name', m.full_name || session.user.email?.split('@')[0] || '');
      set('email', session.user.email || '');
      set('department', m.department || '');
      set('designation', m.designation || '');
      set('contact', m.contact || '');
      set('state', m.state || '');
      set('district', m.district || '');
      return;
    }

    const table = tableByRole[role];
    const { data, error } = await window.supabaseClient
      .from(table)
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      msg('No profile exists yet. Fill the form and save it.', 'info');
      if (role === 'trainee') set('email', session.user.email);
      if (role === 'provider') set('email', session.user.email);
      if (role === 'employer') set('contact_email', session.user.email);
      return;
    }

    const map = fieldMap[role];
    Object.entries(map).forEach(([id, col]) => set(id, data[col]));
    if (role === 'trainee') set('email', session.user.email);
    if (role === 'provider') set('email', session.user.email);
    if (role === 'employer') set('contact_email', data.contact_email || session.user.email);
  }

  async function saveRole(role) {
    const session = await getSession();

    if (role === 'admin') {
      const { error } = await window.supabaseClient.auth.updateUser({
        data: {
          full_name: value('name'),
          department: value('department'),
          designation: value('designation'),
          contact: value('contact'),
          state: value('state'),
          district: value('district')
        }
      });
      if (error) throw error;
      toastLike('Administrator profile updated.');
      return { created: false };
    }

    const table = tableByRole[role];
    const map = fieldMap[role];
    const payload = { user_id: session.user.id };

    Object.entries(map).forEach(([id, col]) => {
      const el = $(id);
      if (!el) return;
      if (el.type === 'checkbox') payload[col] = el.checked;
      else {
        const v = value(id);
        payload[col] = v !== '' ? v : null;
      }
    });

    // Account email is authoritative for identity/contact email.
    if (role === 'trainee') payload.email = session.user.email || null;
    if (role === 'provider') payload.email = session.user.email || null;
    if (role === 'employer') payload.contact_email = session.user.email || payload.contact_email || null;

    if (role === 'trainee' && !payload.full_name) throw new Error('Full name is required.');
    if (role === 'provider' && !payload.organization_name) throw new Error('Organization name is required.');
    if (role === 'employer' && (!payload.name || !payload.industry)) {
      throw new Error('Company name and industry are required.');
    }

    if (role === 'trainee' && payload.consent_given && !payload.consent_date) {
      payload.consent_date = new Date().toISOString();
    }
    if (role === 'trainee' && !payload.consent_given) payload.consent_date = null;

    const { data: existing, error: findError } = await window.supabaseClient
      .from(table)
      .select('id')
      .eq('user_id', session.user.id)
      .maybeSingle();
    if (findError) throw findError;

    const query = existing
      ? window.supabaseClient.from(table).update(payload).eq('id', existing.id)
      : window.supabaseClient.from(table).insert(payload);

    const { error } = await query;
    if (error) throw error;

    toastLike(existing ? 'Profile updated successfully.' : 'Profile created successfully.');
    return { created: !existing };
  }

  function toastLike(text, type = 'success') {
    msg(text, type);
  }

  function wire(role) {
    const form = $('profile-form');
    if (!form) return;

    form.addEventListener('submit', async e => {
      e.preventDefault();
      msg('Saving…', 'info');
      try {
        const result = await saveRole(role);
        if (result?.created && role !== 'admin') {
          const moduleRoute = window.getModuleRoute ? window.getModuleRoute(role) : null;
          if (moduleRoute) {
            window.setTimeout(() => { window.location.href = moduleRoute; }, 500);
          }
        }
      } catch (err) {
        console.error(err);
        msg(err.message || 'Unable to save profile.', 'error');
      }
    });

    const back = $('back-btn');
    if (back) {
      back.addEventListener('click', () => {
        const route = window.getModuleRoute ? window.getModuleRoute(role) : null;
        window.location.href = route || 'index.html';
      });
    }

    document.querySelectorAll('[data-logout]').forEach(b => {
      b.addEventListener('click', async () => {
        await window.supabaseClient.auth.signOut();
        location.href = 'index.html';
      });
    });

    loadRole(role).catch(err => {
      console.error(err);
      msg(err.message || 'Unable to load profile.', 'error');
    });
  }

  window.initProfile = wire;
})();
