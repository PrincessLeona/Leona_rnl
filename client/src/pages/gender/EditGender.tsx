import EditGenderForm from "../../components/forms/EditGenderForm";
import MainLayout from "../layout/MainLayout";

const EditGender = () => {
  const content = (
    <>
      <h2>Edit Gender</h2>
      <EditGenderForm />
    </>
  );

  return <MainLayout content={content} />;
};

export default EditGender;