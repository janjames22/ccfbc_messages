import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import SectionTitle from '../components/SectionTitle';
import BibleVersionSelect from '../components/BibleVersionSelect';
import { supabase } from '../lib/supabaseClient';
import { Save, Plus, Trash2, ArrowLeft, WifiOff, Loader } from 'lucide-react';
import { useOffline } from '../hooks/useOffline';

const EditMessage = () => {
  const isOffline = useOffline();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    speaker: '',
    service_date: '',
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

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        setFormData({
          title: data.title || '',
          speaker: data.speaker || '',
          service_date: data.service_date || '',
          main_verse_reference: data.main_verse_reference || '',
          main_verse_text: data.main_verse_text || '',
          summary: data.summary || '',
          full_notes: data.full_notes || '',
          category: data.category || '',
          bible_version: data.bible_version || 'ESV',
        });

        if (data.key_points) setKeyPoints(data.key_points);
        if (data.reflection_questions) setQuestions(data.reflection_questions);
        if (data.related_verses) setRelatedVerses(data.related_verses);

      } catch (error) {
        console.error('Error fetching message for edit:', error);
        alert('Error loading message: ' + error.message);
        navigate('/messages');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchMessage();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (index, value, array, setter) => {
    const newArray = [...array];
    newArray[index] = value;
    setter(newArray);
  };

  const handleRelatedVerseChange = (index, field, value) => {
    const newVerses = [...relatedVerses];
    newVerses[index] = { ...newVerses[index], [field]: value };
    setRelatedVerses(newVerses);
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
    setSaving(true);

    try {
      const { error } = await supabase
        .from('messages')
        .update({
          ...formData,
          key_points: keyPoints.filter(p => p.trim() !== ''),
          reflection_questions: questions.filter(q => q.trim() !== ''),
          related_verses: relatedVerses.filter(v => v.reference.trim() !== ''),
        })
        .eq('id', id);

      if (error) throw error;
      alert('Message updated successfully!');
      navigate(`/messages/${id}`);
    } catch (error) {
      console.error('Error updating message:', error);
      alert('Error updating message: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div style={styles.loadingContainer}>
          <Loader size={48} className="animate-spin" color="var(--primary-blue)" />
          <p>Loading message data...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <button onClick={() => navigate(-1)} style={styles.backBtn} className="btn-large">
        <ArrowLeft size={24} /> Back
      </button>
      
      <SectionTitle 
        title="Edit Message" 
        subtitle="Update existing sermon details and notes. Changes will be reflected immediately." 
      />

      <form onSubmit={handleSubmit} style={styles.form}>
        <div className="card-light" style={styles.formCard}>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Message Title *</label>
              <input 
                type="text" name="title" required 
                value={formData.title} onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Speaker *</label>
              <input 
                type="text" name="speaker" required 
                value={formData.speaker} onChange={handleChange}
                style={styles.input}
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
                style={styles.input}
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
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Main Bible Verse Text</label>
            <textarea 
              name="main_verse_text" 
              value={formData.main_verse_text} onChange={handleChange}
              style={styles.textarea}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Short Summary</label>
            <textarea 
              name="summary" 
              value={formData.summary} onChange={handleChange}
              style={{ ...styles.textarea, height: '120px' }} 
            />
          </div>

          <div style={styles.divider} />

          <div style={styles.sectionLabel}>Key Points</div>
          {keyPoints.map((point, index) => (
            <div key={index} style={styles.arrayRow}>
              <input 
                type="text" 
                value={point} onChange={(e) => handleArrayChange(index, e.target.value, keyPoints, setKeyPoints)}
                style={styles.input}
              />
              <button type="button" onClick={() => removeArrayItem(index, keyPoints, setKeyPoints)} style={styles.iconBtn}>
                <Trash2 size={28} color="#ef4444" />
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
                style={styles.input}
              />
              <button type="button" onClick={() => removeArrayItem(index, questions, setQuestions)} style={styles.iconBtn}>
                <Trash2 size={28} color="#ef4444" />
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
            />
          </div>

          {isOffline && (
            <div style={styles.offlineWarning}>
              <WifiOff size={24} />
              <p>You cannot edit messages while offline. Please connect to the internet to save your changes.</p>
            </div>
          )}

          <button type="submit" disabled={saving || isOffline} className="btn-large" style={{
            ...styles.submitBtn,
            opacity: (saving || isOffline) ? 0.5 : 1,
            cursor: (saving || isOffline) ? 'not-allowed' : 'pointer'
          }}>
            {saving ? 'Updating...' : <><Save size={28} /> Update Message</>}
          </button>
        </div>
      </form>
    </PageContainer>
  );
};

const styles = {
  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '1.5rem', color: 'var(--text-soft)', fontWeight: '700' },
  backBtn: { display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-soft)', marginBottom: '2.5rem', fontWeight: '800', fontSize: 'var(--font-sm)' },
  form: { maxWidth: '900px', margin: '0 auto' },
  formCard: { padding: 'clamp(2rem, 8vw, 4rem)', boxShadow: '0 32px 64px rgba(0, 0, 0, 0.4)' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' },
  formGroup: { marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  label: { fontSize: 'var(--font-xs)', fontWeight: '900', color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '1.5px' },
  input: { background: 'white', border: '2px solid var(--border-light)', borderRadius: '20px', padding: '1.25rem 1.5rem', color: 'var(--text-dark)', fontSize: 'var(--font-base)', fontWeight: '700', outline: 'none', width: '100%', transition: 'var(--transition)', boxShadow: 'var(--shadow-sm)' },
  textarea: { background: 'white', border: '2px solid var(--border-light)', borderRadius: '20px', padding: '1.5rem', color: 'var(--text-dark)', fontSize: 'var(--font-base)', fontWeight: '600', outline: 'none', resize: 'vertical', minHeight: '150px', fontFamily: 'inherit', width: '100%', lineHeight: '1.7', transition: 'var(--transition)', boxShadow: 'var(--shadow-sm)' },
  divider: { height: '3px', background: 'var(--border-light)', margin: '4rem 0' },
  sectionLabel: { fontSize: 'var(--font-md)', fontWeight: '900', marginBottom: '2.5rem', color: 'var(--text-dark)', letterSpacing: '-0.01em' },
  arrayRow: { display: 'flex', gap: '1.25rem', marginBottom: '2rem', alignItems: 'center' },
  iconBtn: { padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '64px', minHeight: '64px', background: '#fef2f2', borderRadius: '16px', border: '2px solid #fee2e2', cursor: 'pointer', transition: 'var(--transition)' },
  addBtn: { color: 'var(--primary-blue)', fontWeight: '900', border: '3px dashed var(--border-light)', width: '100%', marginTop: '1rem', background: 'transparent', borderRadius: '20px', minHeight: '72px', fontSize: 'var(--font-sm)' },
  submitBtn: { width: '100%', background: 'var(--primary-blue)', color: 'white', borderRadius: '24px', boxShadow: '0 16px 40px rgba(15, 95, 168, 0.4)', marginTop: '4rem', minHeight: '80px', fontSize: 'var(--font-md)', fontWeight: '900' },
  offlineWarning: { background: '#fef2f2', border: '2px solid #ef4444', color: '#b91c1c', padding: '2rem', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem', fontSize: 'var(--font-sm)', fontWeight: '800', lineHeight: '1.5' }
};

export default EditMessage;
