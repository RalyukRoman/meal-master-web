import { Link } from 'react-router-dom';

export default function HomePage() {
    return (
        <div className="d-flex flex-column align-items-center mb-4">
            <h2 className="my-3">
                Welcome to MealMaster!
            </h2>

            <p className="mb-1">
                Do you love video games and want to taste your
                favorite dishes in real life? Our site will help
                you turn your culinary fantasies from games into
                real recipes for your kitchen!
            </p>

            <p>
                This site is designed for gamers who want to
                recreate their favorite video game dishes in
                real life. Here you'll find recipes, tips, and
                inspiration for culinary adventures
            </p>

            <p className="fst-italic">
                Cook, experiment and share your results with other gamers!
            </p>
        </div>
    );
}