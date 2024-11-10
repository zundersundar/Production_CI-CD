import React from "react";
import TopNavBar from "../../components/NavBar/TopNavBar";
import AddClientsPage from "../AddClients/AddClientsPage";
import AddClientDialogBox from "../AddClients/components/AddClientDialogBox";
import AddSitesPage from "../AddSites/AddSitesPage";

function HomePage() {
  return (
    <div>
      {/* <AddSitesPage /> */}
      <AddClientsPage />
    </div>
  );
}

export default HomePage;
