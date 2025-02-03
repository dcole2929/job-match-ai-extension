import Popup from './components/Popup';

export default function App() {
  return (
    <div className="min-w-[400px] min-h-[300px] bg-white">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-xl font-bold">Job Match AI</h1>
      </header>
      <main>
        <Popup />
      </main>
    </div>
  );
}
