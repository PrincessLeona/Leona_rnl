import { FormEvent, useState } from 'react';

const EditGenderForm = () => {
  // State to hold the gender input value
  const [gender, setGender] = useState('');

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGender(e.target.value);
  };

  // Handle form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Updated Gender:", gender);
    // Here you can add logic to update the gender in your application
  };

  return (
    <div className="d-flex flex-column align-items-center mt-5">
      <form onSubmit={handleSubmit} className="w-50">
        <div className="form-group mb-3">
          <label htmlFor="gender">Gender</label>
          <input
            type="text"
            className="form-control"
            id="gender"
            name="gender"
            value={gender} // Bind the input value to the state
            onChange={handleChange} // Update state on input change
          />
        </div>
        <div className="d-flex justify-content-end">
          <button type="button" className="btn btn-secondary me-2" onClick={() => console.log("Back button clicked")}>
            Back
          </button>
          <button type="submit" className="btn btn-primary">
            Update
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditGenderForm;