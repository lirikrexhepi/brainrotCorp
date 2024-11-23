const CaptionInput = ({ captionText, onCaptionChange }) => {
  return (
    <div className="space-y-4">
      <textarea
        value={captionText}
        onChange={(e) => onCaptionChange(e.target.value)}
        placeholder="Enter your caption here..."
        className="w-full p-4 rounded-xl bg-neutral-900 text-white border border-neutral-800 focus:border-white focus:ring-1 focus:ring-white outline-none resize-none text-sm"
        rows="4"
      />
    </div>
  );
};

export default CaptionInput;
