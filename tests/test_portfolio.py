from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
import unittest


class PortfolioParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.sections = []
        self.github_links = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if attributes.get("id"):
            self.ids.append(attributes["id"])
        if tag == "section":
            self.sections.append((attributes.get("id", ""), attributes.get("class", "")))
        href = attributes.get("href", "")
        if href.startswith("https://github.com/HiiAliasgar/"):
            self.github_links.append(href)


class PortfolioSmokeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = Path("index.html").read_text(encoding="utf-8")
        cls.parser = PortfolioParser()
        cls.parser.feed(cls.html)
        cls.parser.close()

    def test_html_parses(self):
        self.assertTrue(self.parser.sections)

    def test_about_section_exists(self):
        self.assertIn("about", [section_id for section_id, _ in self.parser.sections])

    def test_featured_projects_section_exists(self):
        self.assertTrue(any("projects-slide" in classes for _, classes in self.parser.sections))

    def test_ids_are_unique(self):
        counts = Counter(self.parser.ids)
        duplicates = [item for item, count in counts.items() if count > 1]
        self.assertEqual(duplicates, [])

    def test_featured_projects_link_to_github(self):
        self.assertGreaterEqual(len(set(self.parser.github_links)), 6)


if __name__ == "__main__":
    unittest.main()
