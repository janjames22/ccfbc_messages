import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import SectionTitle from '../components/SectionTitle';
import BibleVersionSelect from '../components/BibleVersionSelect';
import { supabase } from '../lib/supabaseClient';
import { Save, Plus, Trash2, ArrowLeft } from 'lucide-react';

const AddMessage = () => {
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
      <button onClick={() => navigate(-1)} style={styles.backBtn}>
        <ArrowLeft size={18} /> Back
      </button>
      
      <SectionTitle 
        title="Add New Message" 
        subtitle="Contribute a new sermon to the archive for our community to study." 
      />

      <form onSubmit={handleSubmit} style={styles.form}>
        <div className="card" style={styles.formCard}>
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
              />
            </div>
          </div>

          <div style={styles.divider} />

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Main Bible Verse Reference</label>
              <input 
                type="text" name="main_verse_reference" 
                value={formData.main_verse_reference} onChange={handleChange}
                style={styles.input} placeholder="e.g., Hebrews 11:6"
              />
            </div>
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
              style={{ ...styles.textarea, height: '100px' }} 
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
                <Trash2 size={18} color="#ff4d4d" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem(keyPoints, setKeyPoints)} style={styles.addBtn}>
            <Plus size={18} /> Add Point
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
                <Trash2 size={18} color="#ff4d4d" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem(questions, setQuestions)} style={styles.addBtn}>
            <Plus size={18} /> Add Question
          </button>

          <div style={styles.divider} />

          <div style={styles.formGroup}>
            <label style={styles.label}>Full Notes</label>
            <textarea 
              name="full_notes" 
              value={formData.full_notes} onChange={handleChange}
              style={{ ...styles.textarea, height: '300px' }} 
              placeholder="Detailed sermon notes..."
            />
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Saving...' : <><Save size={20} /> Save Message</>}
          </button>
        </div>
      </form>
    </PageContainer>
  );
};

const styles = {
  backBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', marginBottom: '1.5rem', fontSize: '1rem', fontWeight: '600' },
  form: { maxWidth: '800px', margin: '0 auto' },
  formCard: { padding: '3rem' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' },
  formGroup: { marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontSize: '0.9rem', fontWeight: '700', color: 'var(--light-blue)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { background: 'rgba(5, 7, 13, 0.5)', border: '1px solid var(--border)', borderRadius: '12px', padding: '0.85rem 1rem', color: 'white', fontSize: '1rem', outline: 'none' },
  textarea: { background: 'rgba(5, 7, 13, 0.5)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', color: 'white', fontSize: '1rem', outline: 'none', resize: 'vertical', minHeight: '80px', fontFamily: 'inherit' },
  divider: { height: '1px', background: 'var(--border)', margin: '2rem 0' },
  sectionLabel: { fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.25rem', color: 'white' },
  arrayRow: { display: 'flex', gap: '1rem', marginBottom: '1rem' },
  iconBtn: { padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  addBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-blue)', fontWeight: '700', fontSize: '0.9rem', marginBottom: '2rem' },
  submitBtn: { width: '100%', background: 'var(--primary-blue)', color: 'white', padding: '1.25rem', borderRadius: '16px', fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '2rem', boxShadow: '0 8px 24px rgba(15, 95, 168, 0.3)' },
};

export default AddMessage;
