import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import SectionTitle from '../components/SectionTitle';
import BibleVersionSelect from '../components/BibleVersionSelect';
import { supabase } from '../lib/supabaseClient';
import { Save, Plus, Trash2, ArrowLeft, WifiOff } from 'lucide-react';
import { useOffline } from '../hooks/useOffline';

const AddMessage = () => {
  const isOffline = useOffline();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    speaker: '',
    service_date: new Date().toISOString().split('T')[0],
    main_verse_reference: '',
    main_verse_text: '',
    summary: '',
    full_notes: '',
    category: '',
    bible_version: 'ESV',
  });

  const [keyPoints, setKeyPoints] = useState(['']);
  const [questions, setQuestions] = useState(['']);
  const [relatedVerses] = useState([{ reference: '', text: '', note: '' }]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (index, value, array, setter) => {
    const newArray = [...array];
    newArray[index] = value;
    setter(newArray);
  };

  const addArrayItem = (array, setter, defaultValue = '') => {
    setter([...array, defaultValue]);
  };

  const removeArrayItem = (index, array, setter) => {
    if (array.length > 1) {
      const newArray = array.filter((_, i) => i !== index);
      setter(newArray);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('messages').insert([
        {
          ...formData,
          key_points: keyPoints.filter(p => p.trim() !== ''),
          reflection_questions: questions.filter(q => q.trim() !== ''),
          related_verses: relatedVerses.filter(v => v.reference.trim() !== ''),
        }
      ]);

      if (error) throw error;
      alert('Message added successfully!');
      navigate('/messages');
    } catch (error) {
      console.error('Error adding message:', error);
      alert('Error adding message: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <button onClick={() => navigate(-1)} style={styles.backBtn} className="btn-large">
        <ArrowLeft size={24} /> Back
      </button>
      
      <SectionTitle 
        title="Add New Message" 
        subtitle="Contribute a new sermon to the archive. Use large clear text for easy entry." 
      />

      <form onSubmit={handleSubmit} style={styles.form}>
        <div className="card-light" style={styles.formCard}>
          <div style={styles.formGrid} className="mobile-form-row">
            <div style={styles.formGroup}>
              <label style={styles.label}>Message Title *</label>
              <input 
                type="text" name="title" required 
                value={formData.title} onChange={handleChange}
                style={styles.input} placeholder="e.g., Faith That Pleases God"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Speaker *</label>
              <input 
                type="text" name="speaker" required 
                value={formData.speaker} onChange={handleChange}
                style={styles.input} placeholder="Pastor Name"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Service Date *</label>
              <input 
                type="date" name="service_date" required 
                value={formData.service_date} onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Category</label>
              <input 
                type="text" name="category" 
                value={formData.category} onChange={handleChange}
                style={styles.input} placeholder="e.g., Faith, Hope, Love"
              />
            </div>

            <div style={styles.formGroup}>
              <BibleVersionSelect 
                value={formData.bible_version} 
                onChange={(val) => setFormData(prev => ({ ...prev, bible_version: val }))}
                label="Preferred Bible Version"
              />
            </div>
          </div>

          <div style={styles.divider} />

          <div style={styles.formGroup}>
            <label style={styles.label}>Main Bible Verse Reference</label>
            <input 
              type="text" name="main_verse_reference" 
              value={formData.main_verse_reference} onChange={handleChange}
              style={styles.input} placeholder="e.g., Hebrews 11:6"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Main Bible Verse Text</label>
            <textarea 
              name="main_verse_text" 
              value={formData.main_verse_text} onChange={handleChange}
              style={styles.textarea} placeholder="The full text of the main verse..."
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Short Summary</label>
            <textarea 
              name="summary" 
              value={formData.summary} onChange={handleChange}
              style={{ ...styles.textarea, height: '120px' }} 
              placeholder="A brief overview of the message..."
            />
          </div>

          <div style={styles.divider} />

          <div style={styles.sectionLabel}>Key Points</div>
          {keyPoints.map((point, index) => (
            <div key={index} style={styles.arrayRow}>
              <input 
                type="text" 
                value={point} onChange={(e) => handleArrayChange(index, e.target.value, keyPoints, setKeyPoints)}
                style={styles.input} placeholder={`Point ${index + 1}`}
              />
              <button type="button" onClick={() => removeArrayItem(index, keyPoints, setKeyPoints)} style={styles.iconBtn}>
                <Trash2 size={28} color="#ff4d4d" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem(keyPoints, setKeyPoints)} className="btn-large" style={styles.addBtn}>
            <Plus size={24} /> Add Point
          </button>

          <div style={styles.divider} />

          <div style={styles.sectionLabel}>Reflection Questions</div>
          {questions.map((q, index) => (
            <div key={index} style={styles.arrayRow}>
              <input 
                type="text" 
                value={q} onChange={(e) => handleArrayChange(index, e.target.value, questions, setQuestions)}
                style={styles.input} placeholder={`Question ${index + 1}`}
              />
              <button type="button" onClick={() => removeArrayItem(index, questions, setQuestions)} style={styles.iconBtn}>
                <Trash2 size={28} color="#ff4d4d" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem(questions, setQuestions)} className="btn-large" style={styles.addBtn}>
            <Plus size={24} /> Add Question
          </button>

          <div style={styles.divider} />

          <div style={styles.formGroup}>
            <label style={styles.label}>Full Notes</label>
            <textarea 
              name="full_notes" 
              value={formData.full_notes} onChange={handleChange}
              style={{ ...styles.textarea, height: '400px' }} 
              placeholder="Detailed sermon notes..."
            />
          </div>

          {isOffline && (
            <div style={styles.offlineWarning}>
              <WifiOff size={24} />
              <p>You cannot add messages while offline. Please connect to the internet to save your work.</p>
            </div>
          )}

          <button type="submit" disabled={loading || isOffline} className="btn-large" style={{
            ...styles.submitBtn,
            opacity: (loading || isOffline) ? 0.5 : 1,
            cursor: (loading || isOffline) ? 'not-allowed' : 'pointer'
          }}>
            {loading ? 'Saving...' : <><Save size={28} /> Save Message</>}
          </button>
        </div>
      </form>
    </PageContainer>
  );
};

const styles = {
  backBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '0.75rem', 
    color: 'var(--text-soft)', 
    marginBottom: '2.5rem', 
    fontWeight: '800',
    fontSize: 'var(--font-sm)',
  },
  form: { width: '100%', maxWidth: '900px', margin: '0 auto', minWidth: 0 },
  formCard: { padding: 'clamp(1rem, 5vw, 4rem)', boxShadow: '0 32px 64px rgba(0, 0, 0, 0.4)' },
  formGrid: { 
    display: 'grid', 
    gridTemplateColumns: '1fr', 
    gap: '1.5rem', 
    marginBottom: '2rem' 
  },
  formGroup: { marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 0 },
  label: { fontSize: 'var(--font-xs)', fontWeight: '900', color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { 
    background: 'white', 
    border: '2px solid var(--border-light)', 
    borderRadius: '20px', 
    padding: '1rem', 
    color: 'var(--text-dark)', 
    fontSize: 'var(--font-base)', 
    fontWeight: '700',
    outline: 'none', 
    width: '100%',
    minWidth: 0,
    transition: 'var(--transition)',
    boxShadow: 'var(--shadow-sm)',
  },
  textarea: { 
    background: 'white', 
    border: '2px solid var(--border-light)', 
    borderRadius: '20px', 
    padding: '1rem', 
    color: 'var(--text-dark)', 
    fontSize: 'var(--font-base)', 
    fontWeight: '600',
    outline: 'none', 
    resize: 'vertical', 
    minHeight: '150px', 
    fontFamily: 'inherit', 
    width: '100%', 
    minWidth: 0,
    lineHeight: '1.7',
    transition: 'var(--transition)',
    boxShadow: 'var(--shadow-sm)',
  },
  divider: { height: '3px', background: 'var(--border-light)', margin: '2.5rem 0' },
  sectionLabel: { fontSize: 'var(--font-md)', fontWeight: '900', marginBottom: '1.5rem', color: 'var(--text-dark)', letterSpacing: 0 },
  arrayRow: { display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'center', width: '100%' },
  iconBtn: { 
    padding: '1rem', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minWidth: '52px', 
    minHeight: '52px',
    background: '#fef2f2',
    borderRadius: '16px',
    border: '2px solid #fee2e2',
    cursor: 'pointer',
    transition: 'var(--transition)',
  },
  addBtn: { 
    color: 'var(--primary-blue)', 
    fontWeight: '900', 
    border: '3px dashed var(--border-light)', 
    width: '100%', 
    marginTop: '1rem',
    background: 'transparent',
    borderRadius: '20px',
    minHeight: '60px',
    fontSize: 'var(--font-sm)',
  },
  submitBtn: { 
    width: '100%', 
    background: 'var(--primary-blue)', 
    color: 'white', 
    borderRadius: '24px', 
    boxShadow: '0 16px 40px rgba(15, 95, 168, 0.4)', 
    marginTop: '2.5rem',
    minHeight: '64px',
    fontSize: 'var(--font-md)',
    fontWeight: '900',
  },
  offlineWarning: {
    background: '#fef2f2',
    border: '2px solid #ef4444',
    color: '#b91c1c',
    padding: '1rem',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    marginBottom: '2rem',
    fontSize: 'var(--font-sm)',
    fontWeight: '800',
    lineHeight: '1.5',
  }
};

export default AddMessage;
