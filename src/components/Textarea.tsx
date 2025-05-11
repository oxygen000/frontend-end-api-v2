
const Textarea = ({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) => (
  <div className="mb-6">
    <label className="block text-white font-semibold mb-2">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      className="w-full p-4 
                 rounded-xl 
                 bg-white/10 backdrop-blur-md 
                 border border-white/30 
                 text-white placeholder-white/70 
                 focus:outline-none focus:ring-2 focus:ring-blue-400 
                 resize-none 
                 transition duration-300"
      placeholder={`Enter ${label.toLowerCase()}`}
      rows={4}
    />
  </div>
);

export default Textarea