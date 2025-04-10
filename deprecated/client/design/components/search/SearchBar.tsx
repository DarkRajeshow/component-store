
function SearchBar({ handleSearchChange }: { handleSearchChange: Function }) {
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



export default SearchBar;
