import { NextPage } from "next";
const Contact: NextPage = () => {
  return (
    // https://freefrontend.com/css-logos/
    <div className=" Move flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
      <form className="w-96">
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="name">
            Name
          </label>
          <input
            className="CON"
            type="text"
            id="name"
            name="name"
            placeholder="Your Name"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            className="CON"
            type="email"
            id="email"
            name="email"
            placeholder="Your Email"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 font-bold mb-2"
            htmlFor="message"
          >
            Message
          </label>
          <textarea
            className="CON"
            id="message"
            name="message"
            rows={4}
            placeholder="Your Message"
          ></textarea>
        </div>
        <button
          type="submit"
          className="CON"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Contact;
