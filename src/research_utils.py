from typing import List

from mesh_expander import expand_with_mesh


def parse_keywords(raw_keywords: str) -> List[str]:
    return [kw.strip() for kw in raw_keywords.split(";") if kw.strip()]


def build_pubmed_query(raw_keywords: str) -> str:
    keyword_list = parse_keywords(raw_keywords)
    query_groups = []

    for kw in keyword_list:
        expanded = expand_with_mesh(kw)
        if expanded:
            group = "(" + " OR ".join(expanded) + ")"
            query_groups.append(group)

    return " AND ".join(query_groups)
