package api.app.astrodao.com.core.dto.newsearch.response;

import lombok.Data;

import java.util.List;

@Data
public class DaoVersion {
	private Object changelogUrl;
	private String commitId;
	private List<Integer> version;
	private String hash;
}