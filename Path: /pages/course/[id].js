// Example snippet inside your page component:
import VideoPlayer from "../../components/VideoPlayer";

export default function CoursePage() {
  // yahan tum login user ka naam/phone/id lao (jab auth ready ho)
  const userLabel = "UserID:123 | Manish"; // dynamic bana dena baad me
  return (
    <VideoPlayer
      src={"/videos/sample.mp4"} // ya HLS <source> setup agar use kar rahe ho
      title="Demo Lecture"
      userLabel={userLabel}
    />
  );
}
