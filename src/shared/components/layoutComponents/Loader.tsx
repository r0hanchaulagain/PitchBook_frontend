import React from "react";

const Loader: React.FC = () => (
	<div
		style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}
	>
		<div className="h-32 w-32 animate-spin rounded-full">
			<img src="/images/logo/Logo.png" alt="PitchBook" />
		</div>
	</div>
);

export default Loader;
