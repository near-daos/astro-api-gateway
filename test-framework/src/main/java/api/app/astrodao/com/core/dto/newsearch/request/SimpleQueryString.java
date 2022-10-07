package api.app.astrodao.com.core.dto.newsearch.request;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class SimpleQueryString {
	private String query;
	private List<?> fields;
}