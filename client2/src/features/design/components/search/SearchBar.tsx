import PropTypes from 'prop-types';

function SearchBar({ handleSearchChange }) {
    return (
        <div className="pt-6">
            <input
                type="text"
                placeholder="Search..."
                className="p-2 border rounded-md w-full"
                onChange={(e) => handleSearchChange(e.target.value)}
            />
        </div>
    );
}

SearchBar.propTypes = {
    handleSearchChange: PropTypes.func.isRequired,
};

export default SearchBar;
