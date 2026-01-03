import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah Jenkins",
    role: "Head Chef, The Green Bowl",
    content: "I was dreading the HACCP paperwork for our new location. This tool generated a 90% complete plan in minutes. The inspector was impressed.",
    rating: 5
  },
  {
    name: "Mike Ross",
    role: "Owner, Ross Artisan Meats",
    content: "The AI caught a biological hazard in our curing process that I hadn't documented properly. Worth every penny for the peace of mind.",
    rating: 5
  },
  {
    name: "Elena Rodriguez",
    role: "Quality Manager, FreshPack",
    content: "We use the Pro verification service. It's so much cheaper than hiring a consultant for days, but we still get the expert signature.",
    rating: 4
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Trusted by Food Businesses</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            From local cafes to manufacturing plants, see why food professionals are switching to AI-assisted compliance.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-slate-50 p-8 rounded-2xl border hover:shadow-md transition-shadow flex flex-col">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star 
                    key={j} 
                    className={`h-5 w-5 ${j < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic flex-1">&quot;{t.content}&quot;</p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
