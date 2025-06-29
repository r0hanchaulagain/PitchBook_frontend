import { Button } from "@ui/button";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
const Header = () => {
	const navigate = useNavigate();
	return (
		<div className="flex items-center justify-between bg-black py-4 pt-5 pl-5">
			<a href="/">
				<img className="w-[calc(13vw+5rem)]" src="/images/logo/Brand.png" alt="" />
			</a>
			<nav className="hidden py-3 pr-5 sm:block">
				<ul className="flex gap-6 text-[1.25rem] text-white">
					<Link to={"/"} className="hover:underline">Home</Link>
					<Link to={"/join"} className="hover:underline">Games</Link>
					<Link to={"/futsals"} className="hover:underline">Book Futsal</Link>
					<Link to={"/"} className="hover:underline">C</Link>
					<Link to={"/"} className="hover:underline">D</Link>
					<li className="flex gap-2">
						<Button variant="reverse" onClick={() => navigate("/login")}>Login</Button>
						<Button variant="reverse" onClick={() => navigate("/register")}>Register</Button>
					</li>
				</ul>
			</nav>
			<nav className="block pr-7 sm:hidden">
				<Menu />
			</nav>
		</div>
	);
};

export default Header;
