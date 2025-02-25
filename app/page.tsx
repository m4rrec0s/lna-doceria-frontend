import ProductList from "./components/productsLIst";

export default function Home() {
  return (
    <main className="h-screen w-screen">
      <header className="w-full border-b-2 border-black/30 py-4 px-5">
        <h1 className="text-2xl font-bold">LNA Doceria</h1>
      </header>
      <section>
        <ProductList />
      </section>
    </main>
  );
}
