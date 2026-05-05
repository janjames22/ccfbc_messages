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
  const [relatedVerses, setRelatedVerses] = useState([{ reference: '', text: '', note: '' }]);

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
          <div style={styles.formGrid}>
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
  backBtn: { display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--muted)', marginBottom: '2rem', fontWeight: '800' },
  form: { maxWidth: '800px', margin: '0 auto' },
  formCard: { padding: 'clamp(1.5rem, 5vw, 3rem)' },
  formGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
    gap: '2rem', 
    marginBottom: '2rem' 
  },
  formGroup: { marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  label: { fontSize: '1rem', fontWeight: '800', color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '1px' },
  input: { background: 'white', border: '2px solid var(--border-light)', borderRadius: '16px', padding: '1.25rem', color: 'var(--text-dark)', fontSize: '1.1rem', outline: 'none', width: '100%' },
  textarea: { background: 'white', border: '2px solid var(--border-light)', borderRadius: '16px', padding: '1.25rem', color: 'var(--text-dark)', fontSize: '1.1rem', outline: 'none', resize: 'vertical', minHeight: '120px', fontFamily: 'inherit', width: '100%', lineHeight: '1.6' },
  divider: { height: '2px', background: 'var(--border-light)', margin: '3rem 0' },
  sectionLabel: { fontSize: '1.5rem', fontWeight: '900', marginBottom: '2rem', color: 'var(--text-dark)' },
  arrayRow: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' },
  iconBtn: { padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '54px' },
  addBtn: { color: 'var(--primary-blue)', fontWeight: '800', border: '2px dashed var(--border-light)', width: '100%', marginTop: '0.5rem' },
  submitBtn: { width: '100%', background: 'var(--primary-blue)', color: 'white', borderRadius: '20px', boxShadow: 'var(--shadow-lg)', marginTop: '2rem' },
  offlineWarning: {
    background: 'rgba(255, 77, 77, 0.1)',
    border: '1px solid #ff4d4d',
    color: '#ff4d4d',
    padding: '1.5rem',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '2rem',
    fontSize: '1.1rem',
    fontWeight: '700',
  }
};

export default AddMessage;
