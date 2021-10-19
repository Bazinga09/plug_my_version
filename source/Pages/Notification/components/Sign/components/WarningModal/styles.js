import { makeStyles } from '@material-ui/core/styles';

export default makeStyles(() => ({
  modal: {
    margin: 0,
    background: 'white',
    borderRadius: '10px',
    width: '370px',
    height: '255px',
    padding: '18px 20px 22px',
  },
  modalTitle: {
    margin: '0',
    marginBottom: '14px',
    fontWeight: '600',
    fontSize: '16px',
    lineHeight: '20px',
    color: '#111827',
  },
  modalText: {
    margin: '0',
    marginBottom: '20px',
    fontSize: '16px',
    lineHeight: '20px',
    color: '#374151',
  },
  modalContainer: {
    width: '100%',
    position: 'absolute',
    margin: '-147px auto 0',
    top: '50%',
    zIndex: 1000000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'transparent',
  },
  modalLink: {
    margin: '19px 0 0',
    fontSize: '16px',
    lineHeight: '20px',
    textAlign: 'center',
    width: '100%',
    color: '#3574F4',
    textDecoration: 'none',
    cursor: 'pointer',
    '&:visited': {
      textDecoration: 'none',
      color: '#3574F4',
    },
  },
}));
