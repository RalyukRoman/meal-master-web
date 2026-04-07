import { Link } from 'react-router-dom';

export default function AdminPage() {
    return (
        <div className="d-flex flex-column gap-2 mt-4
                        align-items-center">
            <Link to="/admin/ingredients"
                className="btn btn-primary w-50">
                <p className="m-0">Ingredients</p>
            </Link>

            <Link to="/admin/games"
                  className="btn btn-primary w-50">
                <p className="m-0">Games</p>
            </Link>

            <Link to="/admin/units"
                  className="btn btn-primary w-50">
                <p className="m-0">Units</p>
            </Link>
        </div>
    );
}