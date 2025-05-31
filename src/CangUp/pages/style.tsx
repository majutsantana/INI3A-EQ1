import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFD88D',
  },
  header: {
    backgroundColor: '#B9A6DA',
    height: 90,
  },
  footer: {
    backgroundColor: '#B9A6DA',
    height: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  formContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 30,
    padding: 20,
    flex: 1,
    marginBottom: 10,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 10,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#EDEDED',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#FFC222',
    paddingVertical: 15,
    borderRadius: 40,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
termsText: {
  backgroundColor: '#e5e5e5',
  padding: 12,
  borderRadius: 12,
  textAlign: 'center',
  color: '#333',
  fontSize: 14,
}
});

export default styles;
