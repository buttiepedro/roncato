// KanbanStyles.js
export const uiStyles = {
  board: {
    display: 'flex',
    gap: '24px',
    padding: '40px',
    background: '#f8fafc',
    minHeight: '100vh',
    fontFamily: "'Inter', system-ui, sans-serif",
    overflowX: 'auto'
  },
  column: {
    width: '320px',
    minWidth: '320px',
    display: 'flex',
    flexDirection: 'column'
  },
  columnTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '16px',
    paddingLeft: '8px',
    borderLeft: '4px solid #3b82f6'
  },
  card: {
    background: '#ffffff',
    borderRadius: '12px',
    marginBottom: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    transition: 'transform 0.2s ease'
  },
  cardHeader: {
    padding: '12px 16px',
    background: '#eff6ff',
    borderBottom: '1px solid #dbeafe',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardBody: {
    padding: '16px',
    fontSize: '0.9rem',
    color: '#475569'
  },
  tag: {
    fontWeight: '600',
    color: '#1e293b',
    marginRight: '4px'
  },
  detailBtn:{
    margin: '12px',
    padding: '0.5rem',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'background-color 0.2s ease'
  }
};