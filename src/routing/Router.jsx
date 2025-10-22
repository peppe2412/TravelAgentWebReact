import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/layouts/Layout";
import ChatBot from "../views/ChatBot";

let router = createBrowserRouter([
    {
        path: '/',
        Component: Layout
    },
    {
        index: true,
        Component: ChatBot
    }
])

export default router