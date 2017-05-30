import React from 'react'
import { IndexLink, Link } from 'react-router'
import './ListView.scss'

export const ListView = (props) => (
	<div>
		<ul>
			{Object.keys(props.dataItems).map(function(key, index) {
				<li key={key}>
					{props.dataItems[key].data[index].content}
				</li>
			})}
		</ul>
	</div>
)

export default ListView
