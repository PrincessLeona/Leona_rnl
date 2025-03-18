const AddGenderForm = () => {
  return (
   <>
    <div className="form-group">
        <div className="nb-3">
            <label htmlFor="gender">Gender</label>
            <input 
            type="text"
            className="form-control"
            id="gender"
            name="gender"
            />
        </div>
        <div className="d-flex justify-content-end">
            <button type="submit" className="btn btn-primary">
            SAVE
        </button>
        </div>
    </div>
   </>
  )
}

export default AddGenderForm;