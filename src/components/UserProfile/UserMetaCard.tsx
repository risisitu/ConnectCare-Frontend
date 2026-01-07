import { useModal } from "../../hooks/useModal";
import { useProfileData } from "../../hooks/useProfileData";
import { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { profile, loading, error, updateProfile } = useProfileData();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [allergies, setAllergies] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experienceYears, setExperienceYears] = useState<number | "">("");
  const [clinicAddress, setClinicAddress] = useState("");

  useEffect(() => {
      if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setPhoneNumber((profile as any).phone_number || "");
      setProfileImage((profile as any).profile_image || "");
      setSpecialization((profile as any).specialization || "");
      setExperienceYears((profile as any).experience_years ?? "");
      setClinicAddress((profile as any).clinic_address || "");
      if ("blood_group" in profile) {
        setBloodGroup((profile as any).blood_group || "");
        setDateOfBirth((profile as any).date_of_birth || "");
        setGender((profile as any).gender || "");
        setAllergies((profile as any).allergies || "");
      } else if ("specialization" in profile) {
        // doctor fields
        setBloodGroup("");
        setDateOfBirth("");
        setGender("");
        setAllergies("");
      }
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      if (!profile) return;

      if ("blood_group" in profile) {
        // patient
        const payload = {
          firstName,
          lastName,
          phoneNumber,
          bloodGroup,
          allergies,
          profileImage,
        };
        const res = await updateProfile(payload);
        if (res.success) {
          closeModal();
        } else {
          console.error("Update failed:", res.error);
        }
      } else {
        // doctor
          const specializationVal = specialization || (profile as any).specialization || "";
          const clinicAddressVal = clinicAddress || (profile as any).clinic_address || "";
        const payload = {
          firstName,
          lastName,
          phoneNumber,
          specialization: specializationVal,
          clinicAddress: clinicAddressVal,
          profileImage,
        };
        const res = await updateProfile(payload);
        if (res.success) {
          closeModal();
        } else {
          console.error("Update failed:", res.error);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-5 text-center">Loading profile...</div>;
  }

  if (error) {
    return <div className="p-5 text-center text-red-500">Error loading profile: {error}</div>;
  }

  if (!profile) {
    return <div className="p-5 text-center">No profile data available</div>;
  }

  const fullName = `${profile.first_name} ${profile.last_name}`;
  const profileImgSrc = profile.profile_image || "./images/user/owner.jpg";
  const subtitle =
    "blood_group" in profile ? `Blood: ${profile.blood_group}` : ("specialization" in profile ? profile.specialization : "");

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <img
                src={profileImgSrc}
                alt="user"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "./images/user/owner.jpg";
                }}
              />
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {fullName}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
              {/* Social links removed per request - only Edit button available */}
            </div>
          </div>
          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            Edit
          </button>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              {/* Social links removed per UI update - only Edit remains */}
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>First Name</Label>
                    <Input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Last Name</Label>
                    <Input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email Address</Label>
                    <Input type="text" value={profile.email} />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Phone</Label>
                    <Input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                  </div>

                  {"blood_group" in profile && (
                    <>
                      <div className="col-span-2 lg:col-span-1">
                        <Label>Blood Group</Label>
                        <Input type="text" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} />
                      </div>

                      <div className="col-span-2 lg:col-span-1">
                        <Label>Date of Birth</Label>
                        <Input type="date" value={dateOfBirth ? new Date(dateOfBirth).toISOString().slice(0,10) : ""} onChange={(e) => setDateOfBirth(e.target.value)} />
                      </div>

                      <div className="col-span-2 lg:col-span-1">
                        <Label>Gender</Label>
                        <Input type="text" value={gender} onChange={(e) => setGender(e.target.value)} />
                      </div>

                      <div className="col-span-2">
                        <Label>Allergies</Label>
                        <Input type="text" value={allergies} onChange={(e) => setAllergies(e.target.value)} />
                      </div>
                    </>
                  )}

                  {"specialization" in profile && (
                    <>
                      <div className="col-span-2 lg:col-span-1">
                        <Label>Specialization</Label>
                        <Input type="text" value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
                      </div>

                      <div className="col-span-2 lg:col-span-1">
                        <Label>Experience (Years)</Label>
                        <Input type="number" value={experienceYears?.toString() || ""} onChange={(e) => setExperienceYears(e.target.value ? Number(e.target.value) : "")} />
                      </div>

                      <div className="col-span-2">
                        <Label>Clinic Address</Label>
                        <Input type="text" value={clinicAddress} onChange={(e) => setClinicAddress(e.target.value)} />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
